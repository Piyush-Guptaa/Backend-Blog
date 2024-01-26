export class Blog {
    
    constructor(title, author, mainContent, publishingDate) {
        this.title = title;
        this.author = author;
        this.mainContent = mainContent;
        this.publishingDate = publishingDate;
    }
    comments = [];
}

