const express = require('express');
const sharp = require('sharp');
var fs = require('fs');

const prepImage = (src, offsetX, offsetY, bboxw, bboxh, width, height, scalingFactor, color, opacity) => {
    scalingFactor = (typeof scalingFactor !== 'undefined') ? scalingFactor : 0.85;
    color = (typeof color !== 'undefined') ? color : "#4289f4";
    opacity = (typeof opacity !== 'undefined') ? opacity : 0.5;

    return sharp(src)
        .metadata()
        .then(infos => {
            const imgWidth = infos.width;
            const imgHeight = infos.height;


            const ratiow = width/bboxw;
            const ratioh = height/bboxh;
            const ratio = Math.min(ratiow, ratioh);
            
            const rect = new Buffer(
                '<svg><rect x="0" y="0" width="'+ bboxw +'" height="'+ bboxh +'" fill="'+ color +'" fill-opacity="'+ opacity +'" /></svg>'
            );

            
            // If the offset is smaller than the adjustment, we simply put the bounding box at the offset.
            var adjustX = Math.min(imgWidth-bboxw, Math.min(offsetX, (width - bboxw*ratio*scalingFactor)/2/ratio/scalingFactor));
            var adjustY = Math.min(imgHeight-bboxh, Math.min(offsetY, (height - bboxh*ratio*scalingFactor)/2/ratio/scalingFactor));
            
            offsetX = Math.max(0,offsetX - adjustX);
            offsetX = Math.min(offsetX, imgWidth-bboxw);
            offsetY = Math.max(0,offsetY - adjustY);
            offsetY = Math.min(offsetY, imgHeight-bboxh);
            
            adjustX = Math.round(adjustX);
            adjustY = Math.round(adjustY);

            console.log(offsetX, offsetY, adjustX, adjustY);
            
            return sharp(src)
                .extract({
                    left: Math.round(offsetX),
                    top: Math.round(offsetY),
                    width: Math.round(width/scalingFactor/ratio),
                    height: Math.round(height/scalingFactor/ratio)
                })
                .overlayWith(rect, {left: Math.round(adjustX), top: Math.round(adjustY)})
                .toBuffer()
                .then((buffer) => {
                    return sharp(buffer)
                        .resize(width, height)
                        .embed()
                        .toBuffer();
                })
                .catch((err) => {
                    if(err){
                        console.log("Error with", src);
                        throw err;
                    }
                });
        });
};

var app = express();
//offsetX, offsetY, bboxw, bboxh, width, height, scalingFactor, color, opacity
app.get('/:folder/:image', (req, res) => {
    if(!req.params.image || !req.params.folder) {
        res.send("Bad");
        return;
    }

    var src = req.params.folder + '/' + req.params.image;
    var {offsetX, offsetY, bboxw, bboxh, width, height, scalingFactor, color, opacity} = req.query;
    offsetX = parseInt(offsetX);
    offsetY = parseInt(offsetY);
    bboxw = parseInt(bboxw);
    bboxh = parseInt(bboxh);
    width = parseInt(width);
    height = parseInt(height);
    var cacheFilename = './cache/' + src + '_' + offsetX + '_' + offsetY + '_' + bboxw + '_' + bboxh + '_' + width + '_' + height + '.jpg';

    var img = fs.readFile(cacheFilename, (err, buffer) => {
        if(err) {
            prepImage(src,offsetX, offsetY, bboxw, bboxh, width, height, scalingFactor, color, opacity)
                .then((buffer) => {
                    res.writeHead(200, {'Content-Type':'image/jpeg'});
                    res.end(buffer, 'binary');
                    //fs.writeFileSync(cacheFilename, buffer);
                })
                .catch((err) => {
                    if(err) {
                        console.log("Error in the end with", src);
                    }
                });
            return;
        }
            res.writeHead(200, {'Content-Type':'image/jpeg'});
            res.end(buffer, 'binary');
        });
});

app.listen(3001, function() {
    console.log('listening on 3001');
});
