const gulp = require("gulp");

require("./gulp/dev.js");
require("./gulp/docs.js");

//? запускаємо всю збірку (перераховуємо каманди які повинні запускатись) (з назвою default - запускаємо просtо gulp )
gulp.task(
  "default",
  gulp.series(
    "clean:dev",
    gulp.parallel("html:dev", "css:dev", "img:dev", "fonts:dev", "files:dev", "js:dev"),
    gulp.parallel("start:dev", "watch:dev")
  )
);

//продакшен версія
gulp.task(
  "docs",
  gulp.series(
    "clean:docs",
    gulp.parallel("html:docs", "css:docs", "img:docs", "fonts:docs", "files:docs", "js:docs"),
    gulp.parallel("start:docs")
  )
);
