export class Comment {

    constructor(commentText, owner) {
        this.commentText = commentText;
        this.commentOwner = owner;
        this.id = Date.now();
        this.ownerId = owner._id;
    }
} 