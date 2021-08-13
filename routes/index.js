import * as functions from "firebase-functions";
import fs from "fs";
import path from "path";
import express from "express";
import crypto from "crypto";
import forge from "node-forge";
import archiver from "archiver";

var express = require('express');
var router = express.Router();

const iconFiles = [
    "icon_16x16.png",
    "icon_16x16@2x.png",
    "icon_32x32.png",
    "icon_32x32@2x.png",
    "icon_128x128.png",
    "icon_128x128@2x.png",
];

const websiteJson = {
  websiteName: "Safari Push",
  websitePushID: "web.app.netlify.webpush",
  allowedDomains: ["https://safaripush.netlify.app", "http://safaripush.netlify.app", "https://azure-emilsapi.azurewebsites.net", "http://azure-emilsapi.azurewebsites.net"],
  urlFormatString: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley",
  authenticationToken: "01234567890123456789",
  webServiceURL: "https://azure-emilsapi.azurewebsites.net/var/www/safari.push"
};

const p12Asn1 = forge.asn1.fromDer(fs.readFileSync("../var/www/safari.push/certs/certificate.p12", 'binary'));
const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, functions.config().safari.keypassword);

const certBags = p12.getBags({bagType: forge.pki.oids.certBag});
const certBag = certBags[forge.pki.oids.certBag];
const cert = certBag[0].cert;

const keyBags = p12.getBags({bagType: forge.pki.oids.pkcs8ShroudedKeyBag});
const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag];
const key = keyBag[0].key;

const intermediate = forge.pki.certificateFromPem(fs.readFileSync("../var/www/safari.push/certs/AppleWWDRCA.pem", "utf8"));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/v2/pushPackages/web.app.netlify.push', function(req, res){
  //res.header({"Content-type":"application/zip"});
  //res.sendFile('pushPackage.zip',{root: __dirname});
  if (!cert) {
    console.log("cert is null");

    res.sendStatus(500);
    return;
}

if (!key) {
    console.log("key is null");

    res.sendStatus(500);
    return;
}

const iconSourceDir = "../var/www/safari.push/pushPackage.raw/icon.iconset";

res.attachment("pushpackage.zip");

const archive = archiver("zip");

archive.on("error", function (err) {
    res.status(500).send({ error: err.message });
    return;
});

archive.on("warning", function (err) {
    if (err.code === "ENOENT") {
        console.log(`Archive warning ${err}`);
    } else {
        throw err;
    }
});

archive.on("end", function () {
    console.log("Archive wrote %d bytes", archive.pointer());
});

archive.pipe(res);

archive.directory(iconSourceDir, "icon.iconset");

const manifest = {};

const readPromises =  [];

iconFiles.forEach((i) =>
    readPromises.push(
        new Promise((resolve, reject) => {
            const hash = crypto.createHash("sha512");
            const readStream = fs.createReadStream(
                path.join(iconSourceDir, i),
                { encoding: "utf8" }
            );

            readStream.on("data", (chunk) => {
                hash.update(chunk);
            });

            readStream.on("end", () => {
                const digest = hash.digest("hex");
                manifest[`icon.iconset/${i}`] = {
                    hashType: "sha512",
                    hashValue: `${digest}`,
                };
                resolve();
            });

            readStream.on("error", (err) => {
                console.log(`Error on readStream for ${i}; ${err}`);
                reject();
            });
        })
    )
);

try {
    await Promise.all(readPromises);
} catch (error) {

}});

module.exports = router;
