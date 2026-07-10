---
name: gatsby
description: Use when the user is working on a Gatsby project or asking about Gatsby features like GraphQL data layer, gatsby-node.js, gatsby-config.js, static queries, page queries, source plugins, transformers, image optimization with gatsby-plugin-image, or Gatsby Cloud. Use ONLY for Gatsby-specific tasks.
---

# Gatsby Skill

## Project detection

- Look for `gatsby-config.js` or `gatsby-config.ts` at project root
- Check `package.json` for `gatsby` dependency
- Look for `gatsby-node.js`, `gatsby-browser.js`, `gatsby-ssr.js`

## Key conventions

### File structure
- `gatsby-config.js` — site metadata, plugins, path prefix
- `gatsby-node.js` — programmatic page creation, GraphQL schema customization
- `gatsby-browser.js` — client-side hooks (`wrapRootElement`, `wrapPageElement`, `onClientEntry`)
- `gatsby-ssr.js` — server-side rendering hooks (same API as browser file)
- `src/pages/` — automatic page creation from files
- `src/components/` — reusable React components
- `src/templates/` — templates for programmatic pages
- `src/data/` — markdown, JSON, YAML data files
- `static/` — files served as-is (no processing)

### GraphQL data layer
- Gatsby builds a unified GraphQL schema at build time
- Source plugins pull data; transformer plugins transform it
- Query data in pages with Page Queries (export `query` from page component)
- Query data in any component with Static Queries (`useStaticQuery`)
- `gatsby-transformer-remark` for Markdown
- `gatsby-transformer-sharp` + `gatsby-plugin-sharp` for images

### Page creation (gatsby-node.js)
```js
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const result = await graphql(`
    query {
      allMarkdownRemark {
        nodes { frontmatter { slug } }
      }
    }
  `);
  result.data.allMarkdownRemark.nodes.forEach(node => {
    createPage({
      path: node.frontmatter.slug,
      require.resolve('./src/templates/blog-post.js'),
      context: { slug: node.frontmatter.slug },
    });
  });
};
```

### Schema customization (gatsby-node.js)
```js
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  createTypes(`
    type MarkdownRemark implements Node {
      frontmatter: Frontmatter!
    }
    type Frontmatter {
      title: String!
      date: Date! @dateformat
      slug: String!
    }
  `);
};
```

### Source and transformer plugins
- `gatsby-source-filesystem` — pull files from local disk
- `gatsby-transformer-remark` — parse Markdown to HTML + frontmatter
- `gatsby-transformer-yaml` / `gatsby-transformer-json` — parse YAML/JSON
- `gatsby-source-graphql` / `gatsby-source-contentful` — remote data sources
- `gatsby-plugin-mdx` — MDX support (Markdown + JSX components)

### Image optimization (gatsby-plugin-image)
```jsx
import { GatsbyImage, getImage } from 'gatsby-plugin-image';

export function Hero({ image }) {
  const imageData = getImage(image);
  return <GatsbyImage image={imageData} alt="Hero" />;
}
```
- Static images: `gatsby-plugin-image` with `fluid` or `fixed` queries
- Use `graphql` fragment: `... on File { childImageSharp { gatsbyImageData } }`

### Styling
- CSS Modules: `*.module.css` (default, zero config)
- Tailwind CSS: `gatsby-plugin-postcss` + `gatsby-plugin-tailwindcss`
- Styled Components / Emotion: `gatsby-plugin-styled-components` / `gatsby-plugin-emotion`
- Global styles: import in `gatsby-browser.js` and `gatsby-ssr.js`

### Environment variables
- `GATSBY_` prefix required for client-side access: `GATSBY_API_URL`
- Server-side (gatsby-node.js): no prefix needed
- `.env.development` / `.env.production` files supported

## Common patterns

### Page query with context
```jsx
// src/templates/blog-post.js
import { graphql } from 'gatsby';

export default function BlogPost({ data }) {
  const post = data.markdownRemark;
  return (
    <article>
      <h1>{post.frontmatter.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}

export const query = graphql`
  query($slug: String!) {
    markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      html
      frontmatter { title date }
    }
  }
`;
```

### Static query in component
```jsx
import { useStaticQuery, graphql } from 'gatsby';

export function Header() {
  const data = useStaticQuery(graphql`
    query {
      site { siteMetadata { title } }
    }
  `);
  return <h1>{data.site.siteMetadata.title}</h1>;
}
```

### Layout pattern
```jsx
// src/components/layout.js
import { useStaticQuery, graphql } from 'gatsby';

export function Layout({ children }) {
  const { site } = useStaticQuery(graphql`
    query { site { siteMetadata { title } } }
  `);
  return (
    <div>
      <header>{site.siteMetadata.title}</header>
      <main>{children}</main>
      <footer>© {new Date().getFullYear()}</footer>
    </div>
  );
}
```

### Client-only routes
```js
// gatsby-config.js
module.exports = {
  plugins: [{
    resolve: 'gatsby-plugin-create-client-paths',
    options: { patterns: ['/app/*'] },
  }],
};
```

## Configuration (`gatsby-config.js`)

```js
module.exports = {
  siteMetadata: {
    title: 'My Site',
    description: 'A Gatsby site',
    siteUrl: 'https://example.com',
  },
  plugins: [
    'gatsby-plugin-image',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-source-filesystem',
      options: { name: 'blog', path: `${__dirname}/content/blog` },
    },
    'gatsby-transformer-remark',
    'gatsby-plugin-postcss',
  ],
};
```

## Common CLI commands

```bash
npx gatsby new my-site        # scaffold new project
npx gatsby develop             # start dev server (port 8000)
npx gatsby build               # production build
npx gatsby serve               # serve production build
npx gatsby clean               # clear .cache and public
npx gatsby plugin list         # list active plugins
npx gatsby graphql             # open GraphiQL explorer
```

## Gotchas

- GraphQL queries must be static (no template literals, no variables outside query variables)
- `createPages` runs at build time only — changes require rebuild
- `gatsby-browser.js` and `gatsby-ssr.js` must export individual functions, not default export
- Image nodes require both `gatsby-plugin-sharp` and a transformer plugin
- `GATSBY_` prefix is mandatory for any env var used in browser code
- Hot reloading can be slow with large GraphQL schemas — use `gatsby clean` when in doubt
- MDX requires both `gatsby-plugin-mdx` and a source plugin (e.g., `gatsby-source-filesystem`)
- Layout component is NOT automatic — must create and import manually (unlike some frameworks)
- `gatsby-node.js` context variables must match the query variable names exactly
