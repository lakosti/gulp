const gulp = require("gulp");
const fileInclude = require("gulp-file-include"); //* ім'я беремо із залежностей
const sass = require("gulp-sass")(require("sass"));
const sassGlob = require("gulp-sass-glob");
const server = require("gulp-server-livereload");
const clean = require("gulp-clean");
const fs = require("fs");
const sourceMaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const webpack = require("webpack-stream");
const imagemin = require("gulp-imagemin");
const changed = require("gulp-changed"); //якщо файли не змінились то функція не запускається // є конфлікт з es6 module

// const babel = require("gulp-babel"); //для продакшена

//? видаляємо папку dist
gulp.task("clean:dev", function (done) {
  //якщо папка існує тільки тоді видаляємо
  if (fs.existsSync("./build/")) {
    return gulp.src("./build/", { read: false }).pipe(clean({ force: true }));
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
gulp.task("html:dev", function () {
  return gulp
    .src(["./src/html/**/*.html", "!./src/html/blocks/*.html"])
    .pipe(changed("./build/"), { hasChanged: changed.compareContents })
    .pipe(plumber(plumberConfig("HTML")))
    .pipe(
      fileInclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(gulp.dest("./build/"));
});

//? команда для компіляції scss в css

gulp.task("css:dev", function () {
  return gulp
    .src("./src/scss/*.scss")
    .pipe(changed("./build/css/"))
    .pipe(plumber(plumberConfig("SCSS")))
    .pipe(sourceMaps.init())
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(sourceMaps.write())
    .pipe(gulp.dest("./build/css/"));
});

//? команда для копіювання картинок в dist
gulp.task("img:dev", function () {
  return gulp
    .src("./src/img/**/*")
    .pipe(changed("./build/img/"))
    .pipe(imagemin({ verbose: true })) // отпимізація картинок // можна прибрати оскільки може трохи сповільнювати зборку
    .pipe(gulp.dest("./build/img/"));
});
//? команда для копіювання шрифтів в dist
gulp.task("fonts:dev", function () {
  return gulp
    .src("./src/fonts/**/*")
    .pipe(changed("./build/fonts/"))
    .pipe(gulp.dest("./build/fonts/"));
});
//? команда для копіювання скачаних файлів в dist
gulp.task("files:dev", function () {
  return gulp
    .src("./src/files/**/*")
    .pipe(changed("./build/files/"))
    .pipe(gulp.dest("./build/files/"));
});

//?переносимо js файли до dist
gulp.task("js:dev", function () {
  return (
    gulp
      .src("./src/js/*.js")
      .pipe(changed("./build/js/"))
      .pipe(plumber(plumberConfig("JS")))
      //   .pipe(babel()) // підтримка старих браузерів (використовуємо для продакшена)
      .pipe(webpack(require("../webpack.config.js")))
      .pipe(gulp.dest("./build/js/"))
  );
});

//? команда для лайф серверу в браузері
gulp.task("start:dev", function () {
  return gulp.src("./build/").pipe(
    server({
      livereload: true,
      open: true,
    })
  );
});

//? автоматичне оновлення в разі зміни файлів
gulp.task("watch:dev", function () {
  gulp.watch("./src/scss/**/*.scss", gulp.parallel("css:dev"));
  gulp.watch("./src/**/*.html", gulp.parallel("html:dev"));
  gulp.watch("./src/img/**/*", gulp.parallel("img:dev"));
  gulp.watch("./src/fonts/**/*", gulp.parallel("fonts:dev"));
  gulp.watch("./src/files/**/*", gulp.parallel("files:dev"));
  gulp.watch("./src/js/**/*.js", gulp.parallel("js:dev"));
});

// gulp.parallel(); // паралельно
// gulp.series(); // по черзі
