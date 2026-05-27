export type CommentProvider = 'giscus' | 'twikoo' | 'waline' | 'utterances' | 'disqus';

export interface CommentConfig {
  provider: CommentProvider;
  giscus?: { repo: string; repoId: string; category: string; categoryId: string; mapping?: string; lang?: string };
  twikoo?: { envId: string };
  waline?: { serverURL: string };
  utterances?: { repo: string; theme?: string };
  disqus?: { shortname: string };
}
