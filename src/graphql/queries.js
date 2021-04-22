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

export const CHANGE_MANGA = `
mutation updateManga ($id: Int!, $title: String!, $synopsis: String, $volumes: Int, $chapters: Int, $ongoing: Boolean, ) {
  updateCourse (id: $id,
    data: { 
    title: $title,
    synopsis: $synopsis,
    volumes: $volumes,
    chapters: $chapters,
    ongoing: $ongoing,
    }
  ) {
      id
  }
}

`