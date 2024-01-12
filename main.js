const cheerio = require('cheerio');
const express = require('express');
const wiki = require('wikijs').default({
  apiUrl : 'https://wiki.resonite.com/api.php'
});
const app = express();
const port = 40000;

async function main(component) {
  const page = await wiki.page(`${component}_(Component)`);
  const html = await page.html();
  const $ = cheerio.load(html);
  const fields = [];

  console.log(html)

  // ヘッダーを取得
  const headers = [];
  $('.wikitable tr').eq(0).find('th').each(function() {
    headers.push($(this).text().trim());
  });

  // データ行を解析
  $('.wikitable tr').slice(1).each(function() {
    const row = {};
    $(this).find('td').each(function(index) {
      const header = headers[index];
      row[header] = $(this).text().trim();
    });
    fields.push(row);
  });

  // なんか一部IntroductionのTypoがあったのでこうなってる
  const descArray = []
  if ($('#Introduction').length > 0){
    $('#Introduction').eq(0).parent().nextUntil('h2').each((index, e) => descArray.push($(e).text()))
  }else{
    if($('#Intoduction').length > 0){
      $('#Intoduction').eq(0).parent().nextUntil('h2').each((index, e) => descArray.push($(e).text()))
    }else{
      descArray.push($('figure').eq(0).next().text())
    }
  }

  return {
    title: component,
    description: descArray.join('\n').trim(),
    fields,
  };
}

app.get('/', async (req, res) => {
  const component = req.query.component;
  if (!component) {
    return res.status(400).send('Component is required');
  }

  try {
    const result = await main(component)
    res.header('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  } catch (error) {
    console.log(error)
    res.status(500).send('Error fetching page');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
