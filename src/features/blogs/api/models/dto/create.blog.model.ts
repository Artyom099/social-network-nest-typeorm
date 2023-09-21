export type CreateBlogModel = {
  id: string;
  inputModel: {
    name: string;
    description: string;
    websiteUrl: string;
  },
  createdAt: Date;
  isMembership: boolean;
  userId: string;
  userLogin: string;
  isBanned: boolean;
  banDate: null,
}