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

It is already easy for your customers to find what they are looking for, there is no need so intimidate them with a bunch of advanced filtering options. Just Shopify's build in Search and Tag filtering should be more than enough.

### You just want infinite scroll or search previews

You don't need Crisp to accomplish this. It is overkill. If this is your goal then consider writing your own [templates](#templates) and making the ajax requests yourself. It also makes it easier to account for some of the [seo concerns](#seo-concerns)

### You want to filter a giant catalog of products

Crisp does it's best to optimize for performance but it can only take it so far. If you are wanting to filter thousands of products without narrowing down the selection first (think `/collections/all`) Crisp may take too long to return results. In this case consider restructuring your "funnel" if you want to use Crisp, or use an app instead.

## How it Works

Crisp is made up of two components, the client and the template. The client is is a Javascript library that allows (relatively) easy access to the filtered data. The second component is the template that is installed in the Shopify theme which gives the client access to raw unfiltered data.

### Template

Crisp relies on the fairly wellknown technique of using Liquid templates to create pages that can be used as JSON endpoints. This allows the client to load the data which can then be filtered.

The template is simply a secondary template file in your theme (`collection.crisp.liquid` for example) that will never be seen when viewing the website normally. It starts with the line `{% layout none %}` which tells Shopify not to include the normal framing content of your site (header, tracking scripts, etc.). It then uses Liquid to build a JSON blob that the client will be able to recognize.

The client will be able to make `fetch` or `ajax` calls to access this JSON data. This can be done by changing the `view` query parameter to match the name of the template (`example.com?view=crisp` for example).

See the [/templates](/templates) folder for some pre-populated examples of templates.

### Client

The client is where the "magic" happens. This is where all of the data loading, filtering, and configuration lives.

At it's most basic, you ask the client to get you some, for example, products from the `shoes` collection. The client will load data from the template url (`/collections/shoes?view=crisp`), process it, and return to you to display to the user.

This gets more complicated when you ask tougher questions. If this time you want Size `9` or `10` running shoes in pink or purple things get a little more complicated under the hood but the interface you communicate with remains the same.

To get a little bit more into it, Crisp tries to find a balance between performance and resource usage while loading and filtering. This involves making some educated guesses in terms of how many shoes to load immediately and cancelling any extraneous requests made from the guesses as quickly as possible. Of course there are still cases where there is only one item that matches the filter constraints and it is the very last one, but in most cases Crisp works quite quickly.

## Getting Started

## Seo Concerns

