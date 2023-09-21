import {BanUserCurrentBlogInputModel} from '../input/ban.user.current.blog.input.model';

export type BanUserForBlogModel = {
  userId: string,
  login: string,
  createdAt: string,
  inputModel: BanUserCurrentBlogInputModel,
}