const gulp = require('gulp')
const changed = require('gulp-changed')

const src = 'src/frontend'
const dest = 'public/assets/frontend'

const config = {
    src: src + '/fonts/**/*',
    dest: dest + '/fonts'
}

const copy = () => {
    return gulp.src(config.src)
        .pipe(changed(config.dest))
        .pipe(gulp.dest(config.dest))
}
copy.displayName = 'fonts:copy'

module.exports = {
    task: copy,
    watch: null
}