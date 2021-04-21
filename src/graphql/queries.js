import gql from "graphql-tag";

export const ALL_MANGA = `
query allManga{
  allManga{
    title
    title_english
    title_japanese
    ongoing
    publishedFrom
    publishedTo
    image_url
    id
    synopsis
    volumes
    author{
      name
    }
  }
}
`;

