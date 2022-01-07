const axios = require("axios");
const fs = require('fs');
const { formatDirName, downloadAllImages, remapLinks, mediaDirName } = require('./utils');
const path = require('path');

class Parser {
    categories = {};
    rootDir = `${path.resolve('./')}/docs`;

    constructor() {
        fs.rmSync(this.rootDir, { recursive: true, force: true }, () => {})
        fs.rmSync(mediaDirName, { recursive: true, force: true }, () => {})
        fs.mkdirSync(this.rootDir, () => {})
        fs.mkdirSync(mediaDirName, () => {})
    }

    fetchAll = async () => {
        this.categories = {};

        await this.fetchCategories();
        await this.fetchSections(0);

        const categoryIds = Object.keys(this.categories);

        for (const categoryId of categoryIds) {
            await this.fetchArticles(categoryId, 0);

            const categoryDirectoryName = `${this.rootDir}/${formatDirName(this.categories[categoryId].name)}`;

            await fs.mkdir(categoryDirectoryName, (e) => e && console.error(e));

            const sections = Object.values(this.categories[categoryId].sections);

            for (const section of sections) {
                const sectionDirectoryName = `${categoryDirectoryName}/${formatDirName(section.name)}`;

                await fs.mkdir(sectionDirectoryName, (e) => e && console.error(e));

                const sectionArticles = Object.values(section.articles);

                for (const article of sectionArticles) {
                    this.createArticle(article, sectionDirectoryName);
                }
            }
        }
        // console.log(this.categories['200181433'].sections['200294859'].articles['202953495'].body);
        // await downloadAllImages(this.categories['200181433'].sections['200294859'].articles['202953495']);
        // console.log("FINISHED");
    }

    createArticle = async (article, sectionDirectoryName) => {
        const fileName = `${sectionDirectoryName}/${formatDirName(article.name)}.md`;

        // await downloadAllImages(article);

        await remapLinks(article, this.categories);

        const body = '---\n' +
            `title: "${article.title}"\n` +
            `description: "${article.title}"\n` +
            'ms.custom: ""\n' +
            `ms.date: "${article.createdAt}"\n` +
            'ms.prod: TakeLessons\n' +
            'ms.prod_service: connectivity\n' +
            'ms.reviewer: ""\n' +
            'ms.technology: connectivity\n' +
            'ms.topic: conceptual\n' +
            `author: ${article.authorId}\n` +
            '---\n' + article.body;

        await fs.writeFile(fileName, body, (e) => e && console.log(e));
    }

    fetchCategories = async () => {
        const response = await axios('https://takelessons.zendesk.com/api/v2/help_center/en-us/categories')

        this.categories = response.data.categories.reduce((acc , category) => {
            acc[category.id] = {
                name: category.name,
                sections: {}
            };

            return acc;
        }, {});
    }

    fetchSections = async (page) => {
        const response = await axios(`https://takelessons.zendesk.com/api/v2/help_center/en-us/sections?page=${page}&per_page=100`)

        response.data.sections.forEach(section => {
            if (this.categories[section.category_id]) {
                this.categories[section.category_id].sections[section.id] = {
                    name: section.name,
                    categoryId: section.category_id,
                    articles: {}
                }
            }
        })

        if (response.data.next_page) {
            await this.fetchSections(response.data.page + 1);
        }
    }

    fetchArticles = async (categoryId, page) => {
        const response = await axios.get(`https://takelessons.zendesk.com/api/v2/help_center/en-us/categories/${categoryId}/articles?page=${page}&per_page=100`);

        response.data.articles.forEach(article => {
            if (this.categories[categoryId].sections[article.section_id]) {
                this.categories[categoryId].sections[article.section_id].articles[article.id] = {
                    id: article.id,
                    name: article.name,
                    title: article.title,
                    body: article.body,
                    createdAt: article.created_at,
                    updatedAt: article.updated_at,
                    editedAt: article.edited_at,
                    sectionId: article.section_id,
                    authorId: article.author_id,
                    categoryId,
                }
            }
        })

        if (response.data.next_page) {
            await this.fetchArticles(categoryId, response.data.page + 1);
        }
    }
}

module.exports = Parser;