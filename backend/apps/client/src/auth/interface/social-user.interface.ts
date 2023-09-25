export interface GithubUser extends Express.User {
  githubId: string
  username: string
}

export interface KakaoUser extends Express.User {}
export interface GoogleUser extends Express.User {}
