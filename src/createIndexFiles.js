const fs = require('fs');
const { formatDirName } = require('./utils');

const createRootIndexFile = async () => {
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
        '    - title: Info for Students\n' +
        '      itemType: overview\n' +
        '      url: student-support\n' +
        '    - title: Info for Teachers\n' +
        '      itemType: overview\n' +
        '      url: teachers-support\n' +
        '    - title: TakeLessons Classroom\n' +
        '      itemType: overview\n' +
        '      url: takelessons-classroom';

    await fs.writeFile('docs/index.yml', body, (e) => e && console.log(e));
}

const createSectionIndexFile = async (section, path) => {
    const articles = Object.values(section.articles);

    const body = `title: ${section.name}\n` +
        `summary: ${section.description} \n` +
        '\n' +
        'metadata:\n' +
        `  title: ${section.name}\n` +
        `  description: ${section.description}\n` +
        '  ms.service: takelessons #Required; service per approved list. service slug assigned to your service by ACOM.\n' +
        '  ms.topic: landing-page\n' +
        '  ms.date: 13/01/2022\n' +
        '\n' +
        'landingContent:\n' +
        '  - title: Articles\n' +
        '    linkLists:\n' +
        '      - linkListType: overview\n' +
        articles.reduce((acc = null, article) => {
            acc = `${acc ? `${acc}\n` : ''}` +
                `        - text: "${article.name}"\n` +
                `          url: ${formatDirName(article.name)}.md`;


            return acc;
        }, null);

    await fs.writeFile(`${path}/index.yml`, body, (e) => e && console.log(e));
}

module.exports = {
    createRootIndexFile,
    createSectionIndexFile,
};