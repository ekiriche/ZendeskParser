const axios = require('axios');
const fs = require('fs');
const path = require('path');

const mediaDirName = `${path.resolve('./')}/media`;

const formatDirName = (name) => {
    if (!name) {
        return null;
    }

    return name.toLowerCase().trim().replace(/\s/g, '-').replace(/\?|'|"|:/g, '').replace(/\//g, 'and');
}

const downloadAllImages = async (article) => {
    const regex = /<img.*?src="(.*?)"[^>]+>/g;

    const images = [ ...article.body.matchAll(regex) ].map(item => item[1]);

    if (!images.length) {
        return;
    }

    const articleDirName = `${mediaDirName}/${formatDirName(article.name)}`;

    if (!fs.existsSync(articleDirName)) {
        await fs.mkdir(articleDirName, (e) => e && console.log(e));
    }

    for (const img of images) {
        let url = img;

        if (!url.startsWith('http')) {
            url = `https://support.takelessons.com${url}`;
        }

        const newImgSrc = await downloadFromUrl(url, articleDirName, article, img);

        article.body = article.body.replace(img, newImgSrc);
    }
}

const downloadFromUrl = async (url, articleDirName) => {
    try {
        const response = await axios(url, { responseType: 'arraybuffer' });

        const fileName = `${articleDirName}/${formatDirName(url.split('/').pop())}`;

        await fs.writeFile(fileName, response.data, (e) => {
            if (e) console.log(e);
        });

        return fileName;
    } catch (e) {
        // console.log(url, articleDirName);
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

    console.log(articleIds);

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

                console.log(linkDocReference);

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
    mediaDirName,
};