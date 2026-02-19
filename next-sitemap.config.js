/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://ui-iota-nine.vercel.app",
  generateRobotsTxt: true,
  generateIndexSitemap: true,
};
