const gulp = require("gulp");
const fileInclude = require("gulp-file-include"); //* ім'я беремо із залежностей

//CSS
const sass = require("gulp-sass")(require("sass"));
const sassGlob = require("gulp-sass-glob");
const autoprefixer = require("gulp-autoprefixer");
const sourceMaps = require("gulp-sourcemaps");
const groupMedia = require("gulp-group-css-media-queries"); // групує медіа запити, але порушується робота sourcemaps
const webpCss = require("gulp-webp-css");

const server = require("gulp-server-livereload");
const clean = require("gulp-clean");
const fs = require("fs");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const webpack = require("webpack-stream");
const babel = require("gulp-babel");
const csso = require("gulp-csso"); //мініфіцирує css
const changed = require("gulp-changed"); //якщо файли не змінились то функція не запускається // є конфлікт з es6 module

//HTML
const htmlclean = require("gulp-htmlclean"); //мініфіцирує html
const webpHTML = require("gulp-webp-html");

//IMG
const webp = require("gulp-webp");
const imagemin = require("gulp-imagemin");

//? видаляємо папку dist
gulp.task("clean:docs", function (done) {
  //якщо папка існує тільки тоді видаляємо
  if (fs.existsSync("./docs/")) {
    return gulp.src("./docs/", { read: false }).pipe(clean({ force: true }));
  }
  done();
});

//? підключення одних html файлів в інші
const plumberConfig = (title) => {
  return {
    errorHandler: notify.onError({
      title: title,
      message: "Error: <%= error.message %>",
      sound: false,
    }),
  };
};
gulp.task("html:docs", function () {
  return gulp
    .src(["./src/html/**/*.html", "!./src/html/blocks/*.html"])
    .pipe(changed("./docs/"))
    .pipe(plumber(plumberConfig("HTML")))
    .pipe(
      fileInclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(webpHTML()) //автоматично добавляється тег picture + source для webp
    .pipe(htmlclean())
    .pipe(gulp.dest("./docs/"));
});

//? команда для компіляції scss в css
gulp.task("css:docs", function () {
  return gulp
    .src("./src/scss/*.scss")
    .pipe(changed("./docs/css/"))
    .pipe(plumber(plumberConfig("SCSS")))
    .pipe(sourceMaps.init())
    .pipe(sassGlob())
    .pipe(webpCss()) //автоматично прописується стилі для webp зображень
    .pipe(groupMedia()) // групування медіа запитів / помилка missing {
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(sourceMaps.write())
    .pipe(gulp.dest("./docs/css/"));
});

//? команда для копіювання картинок в dist
gulp.task("img:docs", function () {
  return gulp
    .src("./src/img/**/*")
    .pipe(changed("./docs/img/"))
    .pipe(webp())
    .pipe(gulp.dest("./docs/img/"))
    .pipe(gulp.src("./src/img/**/*"))
    .pipe(changed("./docs/img/"))
    .pipe(imagemin({ verbose: true })) // отпимізація картинок
    .pipe(gulp.dest("./docs/img/"));
});
//? команда для копіювання шрифтів в dist
gulp.task("fonts:docs", function () {
  return gulp
    .src("./src/fonts/**/*")
    .pipe(changed("./docs/fonts/"))
    .pipe(gulp.dest("./docs/fonts/"));
});
//? команда для копіювання скачаних файлів в dist
gulp.task("files:docs", function () {
  return gulp
    .src("./src/files/**/*")
    .pipe(changed("./docs/files/"))
    .pipe(gulp.dest("./docs/files/"));
});

//?переносимо js файли до dist
gulp.task("js:docs", function () {
  return gulp
    .src("./src/js/*.js")
    .pipe(changed("./docs/js/"))
    .pipe(plumber(plumberConfig("JS")))
    .pipe(babel()) // підтримка старих браузерів
    .pipe(webpack(require("../webpack.config.js")))
    .pipe(gulp.dest("./docs/js/"));
});

//? команда для лайф серверу в браузері
gulp.task("start:docs", function () {
  return gulp.src("./docs/").pipe(
    server({
      livereload: true,
      open: true,
    })
  );
});
