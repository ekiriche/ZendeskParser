const fs = require('fs');
const { formatDirName, escapeQuotes } = require('./utils');

const createRootIndexFile = async (categories) => {
    const body = `title: TakeLessons Support Center\n` +
        `summary: How can we help?\n` +
        'metadata:\n' +
        '  title: TakeLessons Support Center\n' +
        '  description: TakeLessons support articles.\n' +
        '  services: service\n' +
        '  ms.service: takelessons #Required; service per approved list. service slug assigned to your service by ACOM.\n' +
        '  ms.topic: hub-page\n' +
        `  ms.date: 13/01/2022 #Required; mm/dd/yyyy format.\n` +
        `\n` +
        'highlightedContent:\n' +
        '  items:\n' +
        categories.reduce((acc = null, category) => {
            acc = `${acc ? `${acc}\n` : ''}` +
                `    - title: "${escapeQuotes(category.name)}"\n` +
                '      itemType: overview\n' +
                `      url: ${formatDirName(category.name)}`;

            return acc;
        }, null);

    fs.writeFileSync('docs/index.yml', body, (e) => e && console.log(e));
}

const createCategoryIndexFile = async (category, path) => {
    const sections = Object.values(category.sections);

    const body = `title: "${escapeQuotes(category.name)}"\n` +
        `summary: Support topics and FAQs\n` +
        '\n' +
        'metadata:\n' +
        `  title: "${escapeQuotes(category.name)}"\n` +
        `  description: Support topics and FAQs\n` +
        '  ms.service: takelessons #Required; service per approved list. service slug assigned to your service by ACOM.\n' +
        '  ms.topic: landing-page\n' +
        '  ms.date: 13/01/2022\n' +
        '\n' +
        'landingContent:\n' +
        '  - title: Articles\n' +
        '    linkLists:\n' +
        '      - linkListType: overview\n' +
        '        links:\n' +
        sections.reduce((acc = null, section) => {
            acc = `${acc ? `${acc}\n` : ''}` +
                `          - text: "${escapeQuotes(section.name)}"\n` +
                `            url: ${formatDirName(section.name)}`;

            return acc;
        }, null);

    fs.writeFileSync(`${path}/index.yml`, body, (e) => e && console.log(e));
}

const createSectionIndexFile = async (section, path) => {
    const articles = Object.values(section.articles);

    const body = `title: "${escapeQuotes(section.name)}"\n` +
        `summary: "${escapeQuotes(section.description)}"\n` +
        '\n' +
        'metadata:\n' +
        `  title: "${escapeQuotes(section.name)}"\n` +
        `  description: "${escapeQuotes(section.description)}"\n` +
        '  ms.service: takelessons #Required; service per approved list. service slug assigned to your service by ACOM.\n' +
        '  ms.topic: landing-page\n' +
        '  ms.date: 13/01/2022\n' +
        '\n' +
        'landingContent:\n' +
        '  - title: Articles\n' +
        '    linkLists:\n' +
        '      - linkListType: overview\n' +
        '        links:\n' +
        articles.reduce((acc = null, article) => {
            acc = `${acc ? `${acc}\n` : ''}` +
                `          - text: "${escapeQuotes(article.name)}"\n` +
                `            url: ${formatDirName(article.name)}.md`;

            return acc;
        }, null);

    fs.writeFileSync(`${path}/index.yml`, body, (e) => e && console.log(e));
}

module.exports = {
    createRootIndexFile,
    createSectionIndexFile,
    createCategoryIndexFile,
};