export type CreateCommentModel = {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  userLogin: string;
  postId: string;
  postTitle: string;
  blogId: string;
  blogName: string;
};
