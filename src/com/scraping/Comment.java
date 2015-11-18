package com.scraping;

/**
 * Created by Trevor on 10/25/2015.
 */
public class Comment {

    private String originFile = "";
    private String commentText = "";
    private String originalCommentText = "";

    public Comment(String originFile, String commentText, String originalCommentText) {
        this.originFile = originFile;
        this.commentText = commentText;
        this.originalCommentText = originalCommentText;
    }

    public String getOriginFile() {
        return originFile;
    }

    public void setOriginFile(String originFile) {
        this.originFile = originFile;
    }

    public String getCommentText() {
        return commentText;
    }

    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Comment comment = (Comment) o;

        if (originFile != null ? !originFile.equals(comment.originFile) : comment.originFile != null) return false;
        if (commentText != null ? !commentText.equals(comment.commentText) : comment.commentText != null) return false;
        return !(originalCommentText != null ? !originalCommentText.equals(comment.originalCommentText) : comment.originalCommentText != null);

    }

    @Override
    public int hashCode() {
        int result = originFile != null ? originFile.hashCode() : 0;
        result = 31 * result + (commentText != null ? commentText.hashCode() : 0);
        result = 31 * result + (originalCommentText != null ? originalCommentText.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "Comment{" +
                "originFile='" + originFile + '\'' +
                ", commentText='" + commentText + '\'' +
                ", originalCommentText='" + originalCommentText + '\'' +
                '}';
    }
}
