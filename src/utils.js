const axios = require('axios');
const fs = require('fs');
const path = require('path');
const got = require('got');

const mediaDirName = `${path.resolve('./')}/docs/media`;

const formatDirName = (name, removeDot = true) => {
    if (!name) {
        return null;
    }

    const regexRemove = removeDot ? /\?|'|"|:|\./g : /\?|'|"|:/g;

    return name.toLowerCase().trim().replace(/\s/g, '-').replace(regexRemove, '').replace(/\//g, 'and');
}

const createTocFile = async (entities, path, linkToYml = false) => {
    const yamlBody = entities.reduce((acc = null, entity) => {
        acc = `${acc ? `${acc}\n` : ''}` +
            `- name: "${entity.name}"\n` +
            `  href: "${formatDirName(entity.name)}${linkToYml ? '/toc.yml' : '.md'}"`;

        return acc;
    }, null);

    fs.writeFileSync(`${path}/toc.yml`, yamlBody, (e) => e && console.error(e));
}

const createRootTocFile = async (categories, path) => {
    const yamlBody = '- name: "TakeLessons"\n' +
        '  href: "index.yml"\n' +
        categories.reduce((acc = null, category) => {
            acc = `${acc ? `${acc}\n` : ''}` +
                `- name: "${category.name}"\n` +
                `  href: "${formatDirName(category.name)}/toc.yml"`;

            return acc;
    }, null);

    fs.writeFileSync(`${path}/toc.yml`, yamlBody, (e) => e && console.error(e));
}

const downloadAllImages = async (article) => {
    const regex = /<img.*?src="(.*?)"[^>]+>/g;

    const images = [ ...article.body.matchAll(regex) ].map(item => item[1]);

    if (!images.length) {
        return;
    }

    const articleName = formatDirName(article.name);
    const articleDirName = `${mediaDirName}/${articleName}`;

    if (!fs.existsSync(articleDirName)) {
        fs.mkdirSync(articleDirName, (e) => e && console.log(e));
    }

    for (const img of images) {
        let url = img;

        if (!url.startsWith('http')) {
            url = `https://support.takelessons.com${url}`;
        }

        const newImgSrc = await downloadFromUrl(url, articleDirName, articleName);

        article.body = article.body.replace(img, newImgSrc);
    }
}

const downloadImage = async (url) => {
    try {
        return await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
    } catch (e) {
        console.log(e);
        return e.response ? null : await downloadImage(url);
    }
}

const downloadFromUrl = async (url, articleDirName, articleName) => {
    try {
        console.log(url, articleDirName);

        const response = await downloadImage(url);

        if (!response) {
            return url;
        }

        const fileName = formatDirName(url.split('/').pop(), false);

        fs.writeFileSync(`${articleDirName}/${fileName}`, response.data, (e) => {
            if (e) console.log(e);
        });

        return `../../media/${articleName}/${fileName}`;
    } catch (e) {
        console.log(e, url, articleDirName);
        return url;
    }
}

const remapLinks = async (article, categories) => {
    const regex = /<a.*?href="(.*?)"/g

    const urls = [ ...article.body.matchAll(regex) ].reduce((acc = [], item) => {
        const url = item[1];

        const tmp = url.split('/');

        if (tmp[tmp.length - 2] !== 'articles') {
            return acc;
        }

        acc.push(url);

        return acc;
    }, []);

    const articleIds = urls.reduce((acc = [], item) => {
        const articleId = item.split('/').pop().split('-')[0];

        acc.push(articleId);

        return acc;
    }, []);

    const categoriesValues = Object.values(categories);

    for (let i = 0; i < articleIds.length; i++) {
        const articleId = articleIds[i];

        for (const category of categoriesValues) {
            const sections = Object.values(category.sections);
            let foundArticle = null;
            let foundSection = null;

            for (const section of sections) {
                if (section.articles[articleId]) {
                    foundArticle = section.articles[articleId];
                    foundSection = section;
                    break;
                }
            }

            if (foundArticle && foundSection) {
                const linkDocReference = `../../${formatDirName(category.name)}/${formatDirName(foundSection.name)}/${formatDirName(foundArticle.name)}.md`;

                // console.log(linkDocReference);

                article.body = article.body.replace(urls[i], linkDocReference);

                break;
            }
        }
    }

}

module.exports = {
    formatDirName,
    downloadAllImages,
    remapLinks,
    createTocFile,
    createRootTocFile,
    mediaDirName,
};