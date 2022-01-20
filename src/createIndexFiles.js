const fs = require('fs');
const { formatDirName, escapeQuotes, getCurrentFormattedDate } = require('./utils');

const createRootIndexFile = async (categories) => {
    const body = `### YamlMime:Hub\n` +
        '\n' +
        `title: TakeLessons Support Center\n` +
        `summary: How can we help?\n` +
        'metadata:\n' +
        '  title: TakeLessons Support Center\n' +
        '  description: TakeLessons support articles.\n' +
        '  services: service\n' +
        '  author: kyrychevg\n' +
        '  ms.service: takelessons\n' +
        '  ms.topic: hub-page\n' +
        `  ms.date: ${getCurrentFormattedDate()}\n` +
        '  ms.author: v-yevheniik@microsoft.com\n' +
        `\n` +
        'highlightedContent:\n' +
        '  items:\n' +
        categories.reduce((acc = null, category) => {
            acc = `${acc ? `${acc}\n` : ''}` +
                `    - title: "${escapeQuotes(category.name)}"\n` +
                '      itemType: overview\n' +
                `      url: ${formatDirName(category.name)}/index.yml`;

            return acc;
        }, null);

    fs.writeFileSync('docs/index.yml', body, (e) => e && console.log(e));
}

const createCategoryIndexFile = async (category, path) => {
    const sections = Object.values(category.sections);

    const body = '### YamlMime:Landing\n' +
        '\n' +
        `title: "${escapeQuotes(category.name)}"\n` +
        `summary: Support topics and FAQs\n` +
        '\n' +
        'metadata:\n' +
        `  title: "${escapeQuotes(category.name)}"\n` +
        `  description: Support topics and FAQs\n` +
        '  author: kyrychevg\n' +
        '  ms.service: takelessons\n' +
        '  ms.topic: landing-page\n' +
        `  ms.date: ${getCurrentFormattedDate()}\n` +
        '  ms.author: v-yevheniik@microsoft.com\n' +
        '\n' +
        'landingContent:\n' +
        '  - title: Articles\n' +
        '    linkLists:\n' +
        '      - linkListType: overview\n' +
        '        links:\n' +
        sections.reduce((acc = null, section, index) => {
            acc = index > 9 ? acc : `${acc ? `${acc}\n` : ''}` +
                `          - text: "${escapeQuotes(section.name)}"\n` +
                `            url: ${formatDirName(section.name)}/index.yml`;

            return acc;
        }, null);

    fs.writeFileSync(`${path}/index.yml`, body, (e) => e && console.log(e));
}

const createSectionIndexFile = async (section, path) => {
    const articles = Object.values(section.articles);

    const body = '### YamlMime:Landing\n' +
        '\n' +
        `title: "${escapeQuotes(section.name)}"\n` +
        `summary: "${escapeQuotes(section.description)}"\n` +
        '\n' +
        'metadata:\n' +
        `  title: "${escapeQuotes(section.name)}"\n` +
        `  description: "${escapeQuotes(section.description)}"\n` +
        '  author: kyrychevg\n' +
        '  ms.service: takelessons\n' +
        '  ms.topic: landing-page\n' +
        `  ms.date: ${getCurrentFormattedDate()}\n` +
        '  ms.author: v-yevheniik@microsoft.com\n' +
        '\n' +
        'landingContent:\n' +
        '  - title: Articles\n' +
        '    linkLists:\n' +
        '      - linkListType: overview\n' +
        '        links:\n' +
        articles.reduce((acc = null, article, index) => {
            acc = index > 9 ? acc : `${acc ? `${acc}\n` : ''}` +
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