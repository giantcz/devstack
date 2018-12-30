var gulp        = require('gulp')
var changed     = require('gulp-changed')
var rename      = require('gulp-rename')
var filter      = require('gulp-filter')
var imagemin    = require('gulp-imagemin')
var pngquant    = require('imagemin-pngquant')
var mozjpeg     = require('imagemin-mozjpeg')
var webp        = require('imagemin-webp')
var debug       = require('gulp-debug')
var tap         = require('gulp-tap')
var path        = require('path')
var fs          = require('fs')
var log         = require('fancy-log')
var fileExists  = require('./utils/fileExists')

const src = 'src/frontend'
const dest = 'public/assets/frontend'

const config = {
    src: src + '/img/**/*',
    watch: [src + '/img/**/*'],
    dest: dest + '/img'
}

const generateWebp = () => {
    var webpFilter = filter(file => /jp(e)?g|png$/.test(file.path));

    return gulp.src(config.src)
        .pipe(changed(config.dest))
        .pipe(webpFilter)
        .pipe(
            imagemin([
                webp({
                    quality: 84,
                    method: 6
                })
            ])
        )
        .pipe(rename({
            extname: '.webp'
        }))
        .pipe(gulp.dest(config.dest))
}
generateWebp.displayName = 'images:webp'


const optimize = () => {

    var optimizationFilter = filter(file => /[^@]\.[^\.]*$/.test(file.path), { restore: true });
    var renameFilter = filter(file => /@\.[^\.]*$/.test(file.path), { restore: true });

    return gulp.src(config.src)
        .pipe(changed(config.dest))
        .pipe(optimizationFilter)
        .pipe(
            imagemin([
                imagemin.gifsicle({interlaced: true}),
                imagemin.svgo({plugins: [{removeViewBox: true}]}),
                pngquant({
                    quality: '70-90',
                    speed: 4,
                    strip: true
                }),
                mozjpeg({
                    progressive: true,
                    quality: 89
                })
            ])
        )
        .pipe(optimizationFilter.restore)
        .pipe(renameFilter)
        .pipe(rename((path) => {
            path.basename = path.basename.replace(/@$/, '');
        }))
        .pipe(renameFilter.restore)
        .pipe(gulp.dest(config.dest))

        // run cleanup for bigger webp files
        .pipe(tap(file => {
            var filePath = path.parse(file.path)
            var webpPath = path.resolve(filePath.dir, filePath.name + '.webp')

            if (fileExists(webpPath)) {
                var webpSize = fs.statSync(webpPath).size
                var originSize = fs.statSync(file.path).size

                if (webpSize > originSize) {
                    fs.unlinkSync(webpPath)
                    log.info('Webp: file ' + webpPath + ' too big. Using origin instead.')
                }
            }
        }))

}
optimize.displayName = 'images:optimize'

module.exports = {
    task: gulp.series(generateWebp, optimize),
    watch: null
}