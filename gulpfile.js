"use strict"

var gulp = require("gulp");

var server = require("browser-sync").create();
var run = require("run-sequence");
var del = require("del");
var newer = require("gulp-newer");

var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");

var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var rename = require("gulp-rename");

var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");

var uglify = require("gulp-uglify");

var webp = require("gulp-webp");


gulp.task("html", function() {
  return gulp.src("*.html")
  .pipe(newer("build"))
  .pipe(posthtml([
    include()
  ]))
  .pipe(gulp.dest("build"))
  .pipe(server.stream());
});

gulp.task("style", function() {
  gulp.src("sass/style.scss")
  .pipe(plumber())
  .pipe(sass({
      includePaths: require("node-normalize-scss").includePaths
    }))
  .pipe(postcss([
    autoprefixer()
  ]))
  .pipe(minify())
  .pipe(rename("style.min.css"))
  .pipe(gulp.dest("build/css"))
  .pipe(server.stream());
});

gulp.task("images", function() {
  return gulp.src("img/**/*.{jpg,png}")
  .pipe(imagemin([
    imagemin.jpegtran({progressive: true}),
    imagemin.optipng({optimizationLevel: 3}),
  ]))
  .pipe(gulp.dest("build/img"));
});

gulp.task("sprite", function() {
  return gulp.src("img/sprite/icon-*.svg")
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"))
});

gulp.task("jscript", function() {
  return gulp.src("js/*.js")
    .pipe(uglify())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest("build/js"));
});

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
  gulp.watch("*.html", ["html"]);
  gulp.watch("sass/**/*.{scss, sass}", ["style"]);
  gulp.watch("img/*", ["images", server.reload]);
  gulp.watch("img/sprite/icon-*.svg", ["sprite", server.reload]);
  gulp.watch("js/*.js", ["jscript", server.reload]);
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("copy", function() {
  return  gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/*.{svg,webp}"
  ], {
    base: "."
  })
  .pipe(gulp.dest("build"));
});

gulp.task("build", function(done) {
  run(
    "clean",
    "copy",
    "html",
    "style",
    "images",
    "sprite",
    "jscript",
    done
  );
});

gulp.task("webp", function() {
  return gulp.src("img/*jpg")
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest("img"));
});
