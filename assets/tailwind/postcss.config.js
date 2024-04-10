const siteDir = __dirname + "/../../"

module.exports = {
  plugins: [
    require("postcss-import")({
      path: [siteDir],
    }),
    require("tailwindcss")(siteDir + "assets/tailwind/tailwind.config.js"),
    require("autoprefixer")({
      path: [siteDir],
    }),
  ],
}
