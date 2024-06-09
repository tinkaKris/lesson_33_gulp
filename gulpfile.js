const { src, dest, task, watch, series, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const browserSync = require("browser-sync").create();
const cssnano = require("cssnano");
const rename = require("gulp-rename");
const postcss = require("gulp-postcss");
const csscomb = require("gulp-csscomb");
const autoprefixer = require("autoprefixer");
const mqpacker = require("css-mqpacker");
const sortCSSmq = require("sort-css-media-queries");

const PATH = {
  scssRoot: "./assets/scss/style.scss",
  scssFiles: "./assets/scss/**/*.scss",
  scssFolder: "./assets/scss",
  htmlFiles: "./*.html",
  jsFiles: "./assets/js/**/*.js",
  cssFolder: "./assets/css",
};

const PLUGINS = [
  autoprefixer({
    overrideBrowserslist: ["last 5 versions", "> 1%"],
    cascade: true,
  }),
  mqpacker({
    sort: sortCSSmq,
  }),
];

function scss() {
  return src(PATH.scssRoot)
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss(PLUGINS))
    .pipe(csscomb())
    .pipe(dest(PATH.cssFolder))
    .pipe(browserSync.stream());
}

function scssDev() {
  const pluginsForDevMode = [...PLUGINS];
  pluginsForDevMode.splice(0, 1);

  return src(PATH.scssRoot, { sourcemaps: true })
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss(pluginsForDevMode))
    .pipe(dest(PATH.cssFolder, { sourcemaps: "true" }))
    .pipe(browserSync.stream());
}

function scssMin() {
  const pluginsForMinified = [...PLUGINS, cssnano({ preset: "default" })];
  return src(PATH.scssRoot)
    .pipe(sass().on("error", sass.logError))
    .pipe(csscomb())
    .pipe(postcss(pluginsForMinified))
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest(PATH.cssFolder));
}

function comb() {
  return src(PATH.scssFiles).pipe(csscomb()).pipe(dest(PATH.scssFolder));
}

function syncInit() {
  browserSync.init({
    server: {
      baseDir: "./",
    },
  });
}

async function reload() {
  browserSync.reload();
}

function watchFiles() {
  syncInit();
  watch(PATH.htmlFiles, reload);
  watch(PATH.jsFiles, reload);
  watch(PATH.scssFiles, series(scss, scssMin));
}

task("scss", series(scss, scssMin));
task("min", scssMin);
task("dev", scssDev);
task("comb", comb);
task("watch", watchFiles);