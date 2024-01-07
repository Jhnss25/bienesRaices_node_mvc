import gulp from 'gulp';
import browserSync from 'browser-sync';

const browser = browserSync.create();

const { watch, parallel } = gulp;

const startBrowserSync  = () => {
    return browser.init({
        proxy: 'http://localhost:3000/',
        port: 4000
    });

}

const dev = () => {
    watch('./controllers/**/*.js').on('change', browser.reload);
    watch('./views/**/*.pug').on('change', browser.reload);
}


export default parallel(startBrowserSync, dev);