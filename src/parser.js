const axios = require("axios");
const fs = require('fs');
const { formatDirName, downloadAllImages, remapLinks, createTocFile, createRootTocFile, getCurrentFormattedDate, mediaDirName } = require('./utils');
const { createRootIndexFile, createSectionIndexFile, createCategoryIndexFile } = require('./createIndexFiles');
const path = require('path');

class Parser {
    categories = {};
    rootDir = `${path.resolve('./')}/docs`;
    createdArticles = 0;
    totalArticles = 0;

    constructor() {
        fs.rmSync(this.rootDir, { recursive: true, force: true }, () => {})
        fs.mkdirSync(this.rootDir, () => {})
        fs.mkdirSync(mediaDirName, () => {})
    }

    fetchAll = async () => {
        console.log('=================== START ===================');

        this.categories = {};
        this.createdArticles = 0;

        await this.fetchCategories();
        await this.fetchSections(0);

        fs.writeFileSync(`${this.rootDir}/index.yml`, 'undefined', (e) => e && console.log(e));

        const categories = Object.values(this.categories);

        await createRootTocFile(categories, this.rootDir);
        await createRootIndexFile(categories);

        for (const category of categories) {
            await this.fetchArticles(category.id, 0);
        }

        for (const category of categories) {
            const categoryDirectoryName = `${this.rootDir}/${formatDirName(category.name)}`;

            fs.mkdirSync(categoryDirectoryName, (e) => e && console.error(e));

            const sections = Object.values(category.sections);

            await createTocFile(sections, categoryDirectoryName, true);
            await createCategoryIndexFile(category, categoryDirectoryName);

            for (const section of sections) {
                const sectionDirectoryName = `${categoryDirectoryName}/${formatDirName(section.name)}`;

                fs.mkdirSync(sectionDirectoryName, (e) => e && console.error(e));

                const sectionArticles = Object.values(section.articles);

                await createTocFile(sectionArticles, sectionDirectoryName);
                await createSectionIndexFile(section, sectionDirectoryName);

                for (const article of sectionArticles) {
                    this.createArticle(article, sectionDirectoryName);
                }
            }
        }
    }

    createArticle = async (article, sectionDirectoryName) => {
        const fileName = `${sectionDirectoryName}/${formatDirName(article.name)}.md`;

        await downloadAllImages(article);

        await remapLinks(article, this.categories);

        const articleTitle = article.title.trim();

        const body = '---\n' +
            `title: "${articleTitle}"\n` +
            `description: "${articleTitle}"\n` +
            'author: kyrychevg\n' +
            'ms.service: takelessons\n' +
            `ms.date: ${getCurrentFormattedDate()}\n` +
            'ms.author: v-yevheniik@microsoft.com\n' +
            '---\n' +
            '\n' +
            `# ${articleTitle}\n` + article.body;

        fs.writeFileSync(fileName, body, (e) => e && console.log(e));

        this.createdArticles++;

        console.log(`================== CREATED ARTICLE ${this.createdArticles}/${this.totalArticles} ==================`)
    }

    fetchCategories = async () => {
        const response = await axios('https://takelessons.zendesk.com/api/v2/help_center/en-us/categories')

        this.categories = response.data.categories.reduce((acc , category) => {
            acc[category.id] = {
                id: category.id,
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
                    description: section.description,
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
        });

        this.totalArticles += response.data.articles.length;

        if (response.data.next_page) {
            await this.fetchArticles(categoryId, response.data.page + 1);
        }
    }
}

module.exports = Parser;