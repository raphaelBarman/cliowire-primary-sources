const sharp = require('sharp');
var fs = require('fs');

exports.getImage = (src, offsetX, offsetY, bboxw, bboxh, width, height, cacheDir, scalingFactor, color, opacity) => {
    cacheDir = (typeof cacheDir !== 'undefined') ? cacheDir : './cache';
    scalingFactor = (typeof scalingFactor !== 'undefined') ? scalingFactor : 0.85;
    color = (typeof color !== 'undefined') ? color : "#4289f4";
    opacity = (typeof opacity !== 'undefined') ? opacity : 0.5;

    var cacheFilename = cacheDir + src + '_' + offsetX + '_' + offsetY + '_' + bboxw + '_' + bboxh + '_' + width + '_' + height + '_'+ scalingFactor+ '_' + color+ '_' + opacity+'.jpg';

    if(!fs.existsSync(cacheFilename)) {

    const ratiow = width/bboxw;
    const ratioh = height/bboxh;
    const ratio = Math.min(ratiow, ratioh);

    const rect = new Buffer(
        '<svg><rect x="0" y="0" width="'+ bboxw +'" height="'+ bboxh +'" fill="'+ color +'" fill-opacity="'+ opacity +'" /></svg>'
    );

    var adjustX = (width - bboxw*ratio*scalingFactor)/2/ratio/scalingFactor;
    var adjustY = (height - bboxh*ratio*scalingFactor)/2/ratio/scalingFactor;

    offsetX = offsetX - adjustX;
    offsetY = offsetY - adjustY;

    adjustX = Math.round(adjustX);
    adjustY = Math.round(adjustY);

    sharp(src)
        .extract({
            left: Math.round(offsetX),
            top: Math.round(offsetY),
            width: Math.round(width/scalingFactor/ratio),
            height: Math.round(height/scalingFactor/ratio)
        })
        .overlayWith(rect, {left: adjustX, top: adjustY})
        .toBuffer()
        .then((buffer) => {
            sharp(buffer)
                .resize(width, height)
                .embed()
                .toFile(cacheFilename)
                .then(() => {
                    return cacheFilename;
                })
                .catch(err => {
                    if(err){
                        console.log("Error with", src);
                        throw err;
                    }
                });
        })
        .catch((err) => {
            if(err){
                console.log("Error with", src);
                throw err;
            }
        });
    }
    return cacheFilename;
};
