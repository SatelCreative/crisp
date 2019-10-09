# Crisp

## Features

Crisp is a javascript library that enables advanced search and filtering capabilities for Shopify themes. It moves the filtering client-side which enables some cool stuff like

- Filtering collections by tags, metafields, or anything else!
- Filtering search results by tags, metafields, etc
- Creating a searchable collection

## Demo

- View Crisp in action:
    - [Colourpop](https://colourpop.com/collections/best-sellers)
    - [Flow Parts](https://flowparts.com/collections/all)
- View on the [Demo Store](https://todo.com)

## When **NOT** to use Crisp

Crisp adds a lot of complexity to a Shopify collection page. In many cases it won't be necessary and could cause headaches. That said, if you are just excited to try Crisp skip down to [getting started](#getting-started)

### You have a small catalog of products

It is already easy for your customers to find what they are looking for, there is no need to intimidate them with a bunch of advanced filtering options. Just Shopify's build in Search and Tag filtering should be more than enough.

### You just want infinite scroll or search previews

You don't need Crisp to accomplish this. It is overkill. If this is your goal then consider writing your own [templates](#templates) and making the ajax requests yourself. It also makes it easier to account for some of the [seo concerns](#seo-concerns)

### You want to filter a giant catalog of products

Crisp does its best to optimize for performance but it can only take it so far. If you are wanting to filter thousands of products without narrowing down the selection first (think `/collections/all`) Crisp may take too long to return results. In this case consider restructuring your "funnel" if you want to use Crisp, or use an app instead.

## How it Works

Crisp is made up of two components, the client and the template. The client is is a Javascript library that allows (relatively) easy access to the filtered data. The second component is the template installed in the Shopify theme which gives the client access to raw unfiltered data.

### Template

Crisp relies on the fairly well-known technique of using Liquid templates to create pages that can be used as JSON endpoints. This allows the client to load and filter data.

The template is simply a secondary template file in your theme (`collection.crisp.liquid` for example) that will never be seen when viewing the website normally. It starts with the line `{% layout none %}` which tells Shopify not to include the normal framing content of your site (header, tracking scripts, etc.). It then uses Liquid to build a JSON blob that the client will be able to recognize.

The client will be able to make `fetch` or `ajax` calls to access this JSON data. This can be done by changing the `view` query parameter to match the name of the template (`example.com?view=crisp` for example).

See the [/templates](/templates) folder for some pre-populated examples of templates.

### Client

The client is where the "magic" happens. This is where all of the data loading, filtering, and configuration lives.

At its most basic, you ask the client to get you some, for example, products from the `shoes` collection. The client will load data from the template url (`/collections/shoes?view=crisp`), process it, and return to you to display to the user.

This gets more complicated when you ask tougher questions. If this time you want Size `9` or `10` running shoes in pink or purple things get a little more complicated under the hood but the interface you communicate with remains the same.

To get a little bit more into it, Crisp tries to find a balance between performance and resource usage while loading and filtering. This involves making some educated guesses in terms of how many shoes to load immediately and cancelling any extraneous requests made from the guesses as quickly as possible. Of course there are still cases where there is only one item that matches the filter constraints and it is the very last one, but in most cases Crisp works quite quickly.

## SEO Concerns

TODO

## Getting Started

### Adding Templates

First up, we need to decide which template(s) you will need to install. This will depend on which features of Crisp you are planning to use. For example, `SearchableCollection` will require a `Collection` template and a `Search` template. If you are unsure which templates are required for a given feature see the corresponding entry in the [API Documentation](#api-documentation) and it will list the required templates.

Now, knowing which templates we will be installing, head over to the [/templates](/templates) directory locate the example files that will need to be installed. Simply copy these files to your theme's `/templates` directory and we are ready to move on

> You may have noticed a strange suffix on all the templates (ex. `__DO-NOT-SELECT__.products`). While this is by no means required, keep in mind that just like any alternate template this will show up in the Shopify Admin as an option for how to display a resource on the storefront. We never want to display this template by default so the underscore prefix ensures it gets pushed to the bottom of the list and, well, the "`DO-NOT-SELECT`" speaks for itself.

> ![Shopify Admin Template Selector Box](./docs/images/template-select.png)

### Installing the Client

There are a number of ways to install the client depending on your bundler or toolchain. For this guide however, we will be simply adding it as a script tag.

Head over to the [latest release](https://github.com/SatelCreative/crisp/releases) and download `crisp.umd.js`. Next, upload this to your themes `/assets` folder. Now we are ready to import it from the theme.

> As with any dependency, it is good practice to only import resources on pages where they are required. For this example however, we will just be adding a global import in `theme.liquid`.

To import Crisp, add `<script type="text/javascript" src="{{ 'crisp.umd.js' | asset_url }}">` in the `<head>` of your `theme.liquid`.

### Trying it out

Now, to test it out and make sure everything is working correctly we can use the developer console. Navigate to your storefront, open the developer tools (`F12` generally), then head to the `console` tab.

We can now make sure the client has been installed correctly by running

```javascript
Crisp.Version
```

It should print a version number corresponding to the [latest release](https://github.com/SatelCreative/crisp/releases) (or whichever version you are using)

Next, we can test out loading and filtering some resources. The exact code you will need to run will depend on which templates you installed by here is an example of loading products from a collection template in the console

```javascript
{
  // Initialize the collection
  const collection = Crisp.Collection({
    handle: 'all',
    template: '__DO-NOT-SELECT__.products',
  });

  // Load first 10 products
  const products = await collection.get({
    number: 10,
  });

  // Print them to the console
  console.log(products);
}
```

# API Documentation

# Documentation

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [Crisp.Collection](#crispcollection)
-   [Collection](#collection)
    -   [Parameters](#parameters)
    -   [Examples](#examples)
    -   [setHandle](#sethandle)
        -   [Parameters](#parameters-1)
        -   [Examples](#examples-1)
    -   [setFilter](#setfilter)
        -   [Parameters](#parameters-2)
        -   [Examples](#examples-2)
    -   [setOrder](#setorder)
        -   [Parameters](#parameters-3)
        -   [Examples](#examples-3)
    -   [clearOffset](#clearoffset)
        -   [Examples](#examples-4)
    -   [cancel](#cancel)
        -   [Examples](#examples-5)
    -   [preview](#preview)
        -   [Parameters](#parameters-4)
        -   [Examples](#examples-6)
    -   [get](#get)
        -   [Parameters](#parameters-5)
        -   [Examples](#examples-7)
    -   [getNext](#getnext)
        -   [Parameters](#parameters-6)
        -   [Examples](#examples-8)
-   [CollectionOrder](#collectionorder)
-   [Crisp.Search](#crispsearch)
-   [Search](#search)
    -   [Parameters](#parameters-7)
    -   [Examples](#examples-9)
    -   [setQuery](#setquery)
        -   [Parameters](#parameters-8)
        -   [Examples](#examples-10)
    -   [setFilter](#setfilter-1)
        -   [Parameters](#parameters-9)
        -   [Examples](#examples-11)
    -   [setTypes](#settypes)
        -   [Parameters](#parameters-10)
        -   [Examples](#examples-12)
    -   [setExact](#setexact)
        -   [Parameters](#parameters-11)
        -   [Examples](#examples-13)
    -   [setAnd](#setand)
        -   [Parameters](#parameters-12)
        -   [Examples](#examples-14)
    -   [setFields](#setfields)
        -   [Parameters](#parameters-13)
        -   [Examples](#examples-15)
    -   [clearOffset](#clearoffset-1)
        -   [Examples](#examples-16)
    -   [cancel](#cancel-1)
        -   [Examples](#examples-17)
    -   [preview](#preview-1)
        -   [Parameters](#parameters-14)
        -   [Examples](#examples-18)
    -   [get](#get-1)
        -   [Parameters](#parameters-15)
        -   [Examples](#examples-19)
    -   [getNext](#getnext-1)
        -   [Parameters](#parameters-16)
        -   [Examples](#examples-20)
-   [SearchType](#searchtype)
-   [SearchField](#searchfield)
-   [Crisp.SearchableCollection](#crispsearchablecollection)
-   [SearchableCollection](#searchablecollection)
    -   [Parameters](#parameters-17)
    -   [Examples](#examples-21)
    -   [setHandle](#sethandle-1)
        -   [Parameters](#parameters-18)
        -   [Examples](#examples-22)
    -   [setQuery](#setquery-1)
        -   [Parameters](#parameters-19)
        -   [Examples](#examples-23)
    -   [setFilter](#setfilter-2)
        -   [Parameters](#parameters-20)
        -   [Examples](#examples-24)
    -   [setOrder](#setorder-1)
        -   [Parameters](#parameters-21)
        -   [Examples](#examples-25)
    -   [setExact](#setexact-1)
        -   [Parameters](#parameters-22)
        -   [Examples](#examples-26)
    -   [setAnd](#setand-1)
        -   [Parameters](#parameters-23)
        -   [Examples](#examples-27)
    -   [setFields](#setfields-1)
        -   [Parameters](#parameters-24)
        -   [Examples](#examples-28)
    -   [clearOffset](#clearoffset-2)
        -   [Examples](#examples-29)
    -   [cancel](#cancel-2)
        -   [Examples](#examples-30)
    -   [get](#get-2)
        -   [Parameters](#parameters-25)
        -   [Examples](#examples-31)
    -   [getNext](#getnext-2)
        -   [Parameters](#parameters-26)
        -   [Examples](#examples-32)
-   [Crisp.Filter](#crispfilter)
-   [Filter](#filter)
    -   [Parameters](#parameters-27)
    -   [Examples](#examples-33)
    -   [select](#select)
        -   [Parameters](#parameters-28)
        -   [Examples](#examples-34)
    -   [deselect](#deselect)
        -   [Parameters](#parameters-29)
        -   [Examples](#examples-35)
    -   [clear](#clear)
        -   [Parameters](#parameters-30)
        -   [Examples](#examples-36)
    -   [context](#context)
        -   [Parameters](#parameters-31)
    -   [fn](#fn)
        -   [Examples](#examples-37)
    -   [getQuery](#getquery)
        -   [Examples](#examples-38)
    -   [setQuery](#setquery-2)
        -   [Parameters](#parameters-32)
        -   [Examples](#examples-39)
    -   [on](#on)
        -   [Parameters](#parameters-33)
        -   [Examples](#examples-40)
-   [FilterModel](#filtermodel)
    -   [Properties](#properties)
-   [FilterEventCallback](#filtereventcallback)
    -   [Parameters](#parameters-34)
-   [Version](#version-1)
    -   [Examples](#examples-41)
-   [isCancel](#iscancel)
    -   [Parameters](#parameters-35)
    -   [Examples](#examples-42)
-   [FilterFunction](#filterfunction)
-   [Payload](#payload)
-   [Callback](#callback)
    -   [Parameters](#parameters-36)
    -   [Examples](#examples-43)

## Crisp.Collection

### Installation

_Make sure the [collection template](https://github.com/SatelCreative/Crisp/blob/master/templates/collection.__DO-NOT-SELECT__.products.liquid) has been added and modified to suit your needs_

### Basic Usage

```javascript
// Create a new instance
const collection = Crisp.Collection({
  handle: 'all', // REQUIRED
  template: '__DO-NOT-SELECT__.products', // REQUIRED
});

// Get the first 10 products
collection.get({
  number: 10,
  callback: function(response) {
    // Handle error
    if (response.error) {
      // Check if due to cancellation
      if (Crisp.isCancel(response.error)) {
        return;
      }
      // Non cancellation error
      throw error;
    }

    // Use products
    console.log(response.payload);
  }
});
```


## Collection

Creates a collection instance

### Parameters

-   `config` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `config.handle` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
    -   `config.template` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
    -   `config.order` **[CollectionOrder](#collectionorder)**  (optional, default `void`)
    -   `config.filter` **[FilterFunction](#filterfunction)**  (optional, default `void`)

### Examples

```javascript
const collection = Crisp.Collection({
  handle: 'all',
  template: '__DO-NOT-SELECT__.products',
});
```

Returns **CollectionInstance** 

### setHandle

#### Parameters

-   `handle` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

#### Examples

```javascript
collection.setHandle('all');
```

### setFilter

#### Parameters

-   `filter` **[FilterFunction](#filterfunction)** 

#### Examples

```javascript
collection.setFilter(function(product) {
  return product.tags.indexOf('no_show' === -1);
});
```

### setOrder

#### Parameters

-   `order` **[CollectionOrder](#collectionorder)** 

#### Examples

```javascript
collection.setOrder('price-ascending');
```

### clearOffset

Clears the internal offset stored by getNext

#### Examples

```javascript
collection.clearOffset();
```

### cancel

Manually cancel active network requests

#### Examples

```javascript
collection.cancel();
```

### preview

Retrieve the first `options.number` products in a collection. No filter support but extremely fast

#### Parameters

-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options.number` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
    -   `options.callback` **[Callback](#callback)**  (optional, default `void`)

#### Examples

```javascript
collection.preview({
  number: 10,
});
```

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;([Payload](#payload) | void)>** 

### get

The most versatile option for retrieving products. Only recommended for use cases that require a large amount of customization

#### Parameters

-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options.number` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
    -   `options.offset` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**  (optional, default `0`)
    -   `options.callback` **[Callback](#callback)**  (optional, default `void`)

#### Examples

```javascript
collection.get({
  number: 10,
});
```

```javascript
const payload = await collection.get({
  number: 10,
  offset: 10,
});
```

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;([Payload](#payload) | void)>** 

### getNext

Similar to get but stores and increments the offset internally. This can be reset with calls to getNext. Recommended for infinite scroll and similar

#### Parameters

-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options.number` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
    -   `options.callback` **[Callback](#callback)** 

#### Examples

```javascript
collection.getNext({
  number: 10,
});
```

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;([Payload](#payload) | void)>** 

## CollectionOrder

-   **See: [shopify sort order](https://help.shopify.com/themes/liquid/objects/collection#collection-default_sort_by)**

Defines in what order products are returned

Type: (`"default"` \| `"manual"` \| `"best-selling"` \| `"title-ascending"` \| `"title-descending"` \| `"price-ascending"` \| `"price-descending"` \| `"created-ascending"` \| `"created-descending"`)

## Crisp.Search

### Installation

_Make sure the [search template](https://github.com/SatelCreative/Crisp/blob/master/templates/search.__DO-NOT-SELECT__.liquid) has been added and modified to suit your needs_

### Basic Usage

```javascript
// Create a new instance
const search = Crisp.Search({
  query: 'apple', // REQUIRED
  template: '__DO-NOT-SELECT__', // REQUIRED
});

// Get the first 10
search.get({
  number: 10,
  callback: function(response) {
    // Handle error
    if (response.error) {
      // Check if due to cancellation
      if (Crisp.isCancel(response.error)) {
        return;
      }
      // Non cancellation error
      throw error;
    }

    // Use products
    console.log(response.payload);
  }
});
```


## Search

Creates a search instance

### Parameters

-   `config` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `config.query` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
    -   `config.template` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
    -   `config.filter` **[FilterFunction](#filterfunction)**  (optional, default `void`)
    -   `config.types` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[SearchType](#searchtype)>**  (optional, default `["article","page","product"]`)
    -   `config.exact` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**  (optional, default `true`)
    -   `config.and` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**  (optional, default `true`)
    -   `config.fields` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[SearchField](#searchfield)>**  (optional, default `[]`)

### Examples

```javascript
const collection = Crisp.Search({
  query: 'blue shirt',
  template: '__DO-NOT-SELECT__',
});
```

Returns **SearchInstance** 

### setQuery

#### Parameters

-   `query` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

#### Examples

```javascript
search.setQuery('blue shirt');
```

### setFilter

#### Parameters

-   `filter` **[FilterFunction](#filterfunction)** 

#### Examples

```javascript
search.setFilter(function(object) {
  return object.type === 'product';
});
```

### setTypes

#### Parameters

-   `types` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[SearchType](#searchtype)>** 

#### Examples

```javascript
search.setTypes(['product']);
```

### setExact

#### Parameters

-   `exact` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

#### Examples

```javascript
search.setExact(false);
```

### setAnd

#### Parameters

-   `and` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

#### Examples

```javascript
search.setAnd(false);
```

### setFields

#### Parameters

-   `fields` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[SearchField](#searchfield)>** 

#### Examples

```javascript
search.setTypes(['title', 'author']);
```

### clearOffset

Clears the internal offset stored by getNext

#### Examples

```javascript
search.clearOffset();
```

### cancel

Manually cancel active network requests

#### Examples

```javascript
search.cancel();
```

### preview

#### Parameters

-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options.number` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
    -   `options.callback` **[Callback](#callback)**  (optional, default `void`)

#### Examples

```javascript
search.preview({
  number: 10,
});
```

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;([Payload](#payload) | void)>** 

### get

#### Parameters

-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options.number` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
    -   `options.offset` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**  (optional, default `0`)
    -   `options.callback` **[Callback](#callback)**  (optional, default `void`)

#### Examples

```javascript
search.get({
  number: 10,
});
```

```javascript
const payload = await search.get({
  number: 10,
  offset: 10,
});
```

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;([Payload](#payload) | void)>** 

### getNext

#### Parameters

-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options.number` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
    -   `options.callback` **[Callback](#callback)** 

#### Examples

```javascript
search.getNext({
  number: 10,
});
```

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;([Payload](#payload) | void)>** 

## SearchType

Type: (`"article"` \| `"page"` \| `"product"`)

## SearchField

Type: (`"title"` \| `"handle"` \| `"body"` \| `"vendor"` \| `"product_type"` \| `"tag"` \| `"variant"` \| `"sku"` \| `"author"`)

## Crisp.SearchableCollection

### Installation

_Make sure the [collection template](https://github.com/SatelCreative/Crisp/blob/master/templates/collection.__DO-NOT-SELECT__.products.liquid) has been added and modified to suit your needs_

_Make sure the [search template](https://github.com/SatelCreative/Crisp/blob/master/templates/search.__DO-NOT-SELECT__.liquid) has been added and modified to suit your needs_

_If you plan to use the `all` collection in shopify it **must** have been created in the shopify admin. Otherwise nothing will be returned when searching within the `all` collection. The easiest conditions for the collection are `price != 0 || price == 0`._

### Basic Usage

```javascript
// Create a new instance
const collection = Crisp.SearchableCollection({
  handle: 'all', // REQUIRED
  collectionTemplate: '__DO-NOT-SELECT__.products', // REQUIRED
  searchTemplate: '__DO-NOT-SELECT__', // REQUIRED
});

// Get the first 10 products
collection.get({
  number: 10,
  callback: function(response) {
    // Handle error
    if (response.error) {
      // Check if due to cancellation
      if (Crisp.isCancel(response.error)) {
        return;
      }
      // Non cancellation error
      throw error;
    }

    // Use products
    console.log(response.payload);
  }
});
```


## SearchableCollection

Creates a collection instance

### Parameters

-   `config` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `config.handle` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
    -   `config.collectionTemplate` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
    -   `config.searchTemplate` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
    -   `config.filter` **[FilterFunction](#filterfunction)**  (optional, default `void`)
    -   `config.order` **[CollectionOrder](#collectionorder)** _Order only works while_ `query === ''` (optional, default `void`)
    -   `config.exact` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**  (optional, default `true`)
    -   `config.and` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**  (optional, default `true`)
    -   `config.fields` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[SearchField](#searchfield)>**  (optional, default `[]`)

### Examples

```javascript
const collection = Crisp.SearchableCollection({
  handle: 'all',
  collectionTemplate: '__DO-NOT-SELECT__.products',
  searchTemplate: '__DO-NOT-SELECT__',
});
```

Returns **SearchableCollectionInstance** 

### setHandle

#### Parameters

-   `handle` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

#### Examples

```javascript
collection.setHandle('all');
```

### setQuery

#### Parameters

-   `query` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

#### Examples

```javascript
collection.setQuery('blue shirt');
```

### setFilter

#### Parameters

-   `filter` **[FilterFunction](#filterfunction)** 

#### Examples

```javascript
collection.setFilter(function(product) {
  return product.tags.indexOf('no_show' === -1);
});
```

### setOrder

_Order only works while_ `query === ''`

#### Parameters

-   `order` **[CollectionOrder](#collectionorder)** 

#### Examples

```javascript
collection.setOrder('price-ascending');
```

### setExact

#### Parameters

-   `exact` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

#### Examples

```javascript
collection.setExact(false);
```

### setAnd

#### Parameters

-   `and` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

#### Examples

```javascript
collection.setAnd(false);
```

### setFields

#### Parameters

-   `fields` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[SearchField](#searchfield)>** 

#### Examples

```javascript
collection.setTypes(['title', 'author']);
```

### clearOffset

Clears the internal offset stored by getNext

#### Examples

```javascript
collection.clearOffset();
```

### cancel

Manually cancel active network requests

#### Examples

```javascript
collection.cancel();
```

### get

#### Parameters

-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options.number` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
    -   `options.offset` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**  (optional, default `0`)
    -   `options.callback` **[Callback](#callback)**  (optional, default `void`)

#### Examples

```javascript
collection.get({
  number: 10,
});
```

```javascript
const payload = await collection.get({
  number: 10,
  offset: 10,
});
```

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;([Payload](#payload) | void)>** 

### getNext

Similar to get but stores and increments the offset internally. This can be reset with calls to getNext. Recommended for infinite scroll and similar

#### Parameters

-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options.number` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
    -   `options.callback` **[Callback](#callback)** 

#### Examples

```javascript
collection.getNext({
  number: 10,
});
```

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;([Payload](#payload) | void)>** 

## Crisp.Filter

### Version

`Crisp.Filter` is available as of version `4.1.0`

### About

While using `SearchableCollection` I noticed that the majority of my javascript was dealing with keeping the filter ui and the filter function in sync. Everything felt a little awkward to I took some inspiration from [flux](https://facebook.github.io/flux/) and designed `Crisp.Filter`

`Crisp.Filter` allows writing filters in a declarative manner and then handles generating a filter function and firing appropriate events.

### Filters

`Crisp.Filter` uses a tree internally to efficiently keep the filter state in sync. This "filter tree" needs to be provided at instantiation so `Crisp.Filter` can fire initial events and build the first filter function.

The filter tree is made up of `node`s with children. For example the simplest `node` looks something like:

```javascript
{
  name: 'my-unique-name',
}
```

The name must be unique to each `node`. To generate a tree like structure we can use the `children` property

```javascript
{
  name: 'parent',
  children: [{
    name: 'child-1',
  }, {
    name: 'child-1',
  }],
}
```

This isn't particularly useful, but now we can start adding in filter functions. Note that `Crisp.Filter`'s `filters` prop takes an array of nodes. The root `node` is handled internally.

```javascript
const filter = Crisp.Filter({
  filters: [{
    name: 'red',
    filter: payload => payload.color === 'red',
  }, {
    name: 'blue',
    filter: payload => payload.color === 'blue',
    selected: true,
  }],
});

['red', 'blue', 'yellow'].filter(filter.fn());
// ['blue']
```

There is a lot to unpack there. First off, each `node` can have a `filter` property. This is a function that takes in the original `payload` (whatever you are filtering) and returns a boolean (like `Array.filter`).

Notably, the `filter` property is ignored unless `selected` is also set to true. We will get more into that later.

Once a `Filter` instance is created, `.fn()` can be called to create a filter function based on the current state of the internal tree. In this case only the 'blue' `node`'s filter is selected so only 'blue' makes it through.

### Hierarchy

Lets say, for example, that we want to filter based on the **size** or **color** of shirts. In this case **size** and **color** will be parent `node`s and the options will be children

```javascript
const filter = Crisp.Filter({
  filters: [{
    name: 'color',
    children: [{
      name: 'red',
      filter: shirt => shirt.color === 'red',
      selected: true,
    }, {
      name: 'blue',
      filter: shirt => shirt.color === 'blue',
    }],
  }, {
    name: 'size',
    children: [{
      name: 'small',
      filter: shirt => shirt.size === 'small',
      selected: true,
    }, {
      name: 'medium',
      filter: shirt => shirt.size === 'medium',
      selected: true,
    }, {
      name: 'large',
      filter: shirt => shirt.size === 'large',
    }],
  }],
});
```

This will now generate a function whose logic can be expressed like

`(size 'small' OR 'medium') AND color 'red'`

This is because the root `node` enforces logical AND on its children by default while all other nodes enforce logical OR. This can be overwridden by using the `and` property of a node or by passing `and: boolean` into the `Filter` options.

### Selection

Selecting & Deselecting filters is very easy. Selection can be declared during instantiation but during runtime it is as simple as

```javascript
filter.select('blue');
filter.deselect('small');
```

For those working with hierarchies there is also a helper for `node`s with children which will deselect all (immediate) children

```javascript
filter.clear('size');
```

Generally these methods will be called from event handlers. For example when someone clicks on a filter.

### Events

`Crisp.Filter` instances emit events that can be subscribed to with the `.on()` method

```javascript
filter.on('update', node => { /* DO STUFF */ });
```

Currently, the only event type is `'update'` which fires anytime a `node`s selected state changes.

This is where filter UI updates should occur.

### URL Params

`Crisp.Filter` also makes syncing the url parameters and filters very easy. Calling `filter.getQuery()` returns a comma delimited string of the currently selected filter names. Conversely, providing `filter.setQuery(string)` with that same string (say on page reload) will select the correct filters and fire corresponding events.


## Filter

Creates a new filter object

### Parameters

-   `config` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `config.filters` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[FilterModel](#filtermodel)>** 
    -   `config.global` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[FilterFunction](#filterfunction)>**  (optional, default `[]`)
    -   `config.and` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**  (optional, default `true`)

### Examples

```javascript
const filter = Filter({
  global: [
    color => typeof color === 'string',
  ],
  filters: [
    {
      name: 'blue',
      filter: color => color === 'blue',
    },
    {
      name: 'red',
      filter: color => color === 'red',
      selected: true,
    },
    {
      name: 'yellow',
      filter: color => color === 'yellow',
    },
  ],
  and: false,
});
```

Returns **FilterInstance** 

### select

Selects a given node in the filter tree

#### Parameters

-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

#### Examples

```javascript
filter.select('blue');
```

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Success

### deselect

Deselects a given node in the filter tree

#### Parameters

-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

#### Examples

```javascript
filter.select('blue');
```

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Success

### clear

Deselects all children of a given node

#### Parameters

-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

#### Examples

```javascript
filter.clear('color');
```

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Success

### context

Returns the context of a given node

#### Parameters

-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

Returns **any** context

### fn

Generates a filter function based on the current state of the filter tree

#### Examples

```javascript
[1, 2, 3].filter(filter.fn());
```

Returns **[FilterFunction](#filterfunction)** 

### getQuery

Returns a comma delimited string of the selected filters

#### Examples

```javascript
filter.getQuery();
// red,yellow
```

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### setQuery

Takes a query are and select the required filters

#### Parameters

-   `query` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `string`  

#### Examples

```javascript
filter.setQuery('red,yellow');
```

### on

The update event

#### Parameters

-   `eventName` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `cb` **[FilterEventCallback](#filtereventcallback)** 

#### Examples

```javascript
filter.on('update', ({ name, parent, selected, context }) => {
  // Update filter ui
});
```

## FilterModel

Type: {name: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), filter: [FilterFunction](#filterfunction)?, exclusive: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?, and: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?, selected: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?, context: any?, children: [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[FilterModel](#filtermodel)>?}

### Properties

-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `filter` **[FilterFunction](#filterfunction)?** 
-   `exclusive` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** 
-   `and` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** 
-   `selected` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** 
-   `context` **any?** 
-   `children` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[FilterModel](#filtermodel)>?** 

## FilterEventCallback

The event callback

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

### Parameters

-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options.name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
    -   `options.parent` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
    -   `options.selected` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 
    -   `options.context` **any** 

## Version

Active version of Crisp

### Examples

```javascript
console.log(Crisp.Version);
// 0.0.0
```

## isCancel

A function to determine if an error is due to cancellation

### Parameters

-   `error` **[error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)** 

### Examples

```javascript
const cancelled = Crisp.isCancel(error);
```

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

## FilterFunction

Accepts an api object and returns whether to keep or remove it from the response

Type: function (any): [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

## Payload

An array of the requested api object. Generally based on a template

Type: [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;any>

## Callback

A callback function that either contains the requested payload or an error. Remember to check if the error is due to cancellation via [isCancel](#iscancel)

Type: function ({payload: [Payload](#payload)?, error: [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)?}): void

### Parameters

-   `args` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `args.payload` **[Payload](#payload)**  (optional, default `undefined`)
    -   `args.error` **[Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)**  (optional, default `undefined`)

### Examples

```javascript
collection.get({
 number: 48,
 callback: function callback(response) {
   var payload = response.payload;
   var error = response.error;

   if (Crisp.isCancel(error)) {
     // Can usually ignore
     return;
   }

   if (error) {
     // Handle error
     return;
   }

   // Use payload
 }
});
```

Returns **[undefined](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined)** 
