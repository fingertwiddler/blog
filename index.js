import Handlebars from "https://jspm.dev/handlebars"
export default async function (items, config, offbase) {
  // build pages
  // Instantiate templates
  let { fs } = offbase;
  let tds = await fs.promises.readFile(config.THEME.HOME, "utf8")
  let tpl = Handlebars.compile(tds)
  await fs.promises.mkdir(`${config.DEST}/pages`).catch((e) => { })
  let { index, pages } = await paginator(items, tpl, config)
  for(let i=0; i<pages.length; i++) {
    await fs.promises.mkdir(`${config.DEST}/pages/${i}`).catch((e) => { })
    await fs.promises.writeFile(`${config.DEST}/pages/${i}/index.html`, pages[i]).catch((e) => { })
  }
  await fs.promises.writeFile(`${config.DEST}/index.html`, index)
}
  //paginator (filenames, meta, template, CHUNK) {
const paginator = (items, template, config) => {
  console.log("items = ", items)
  let pages = [];
  let counter = []
  for (let i=0; i<items.length; i+=config.PAGE.CHUNK) {
    let page = items.slice(i, i + config.PAGE.CHUNK)
    pages.push(page)
    counter.push({ number: i/config.PAGE.CHUNK })
  }
  let res = []
  let index;
  for(let i=0; i<pages.length; i++) {
    console.log("page = ", pages[i])
    counter[i].current = true;
    let html = template({
      title: config.NAME,
      base: "../../",
      items: pages[i].map((item) => {
        return {
          filename: item.key,
          meta: item.data
        }
      }),
      pages: counter
    })
    res.push(html)

    if (i === 0) {
      index = template({
        title: config.NAME,
        base: "./",
        items: pages[i].map((item) => {
          return {
            filename: item.key,
            meta: item.data
          }
        }),
        pages: counter
      })
    }
    counter[i].current = false;
  }
  return { index: index, pages: res }
}
