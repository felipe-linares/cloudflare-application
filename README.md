# Cloudflare Workers Internship Application: Full-Stack

## What is it?

An application that will randomly send users to one of two webpages. Based on internal constant URL `https://cfw-takehome.developers.workers.dev/api/variants`

A live demo can be found here: https://cloudflare-app-2020.flinaresrm.workers.dev/

## How It Works

When a client makes a request to the Workers script, the script will roughly return each variant around 50% of the time.

## Extra Credit

### 1. Changing copy/URLs

- `title`: Was changed to "Your Variant!"
- `h1#title`: Added a '#' before the number in the title
- `p#description`: Added 'number ' before the number in the description
- `a#url`: Routed the url to my LinkedIn and changed text

All of this was done using abstracted functions that used an HTMLRewriter

### 2. Persisting variants

If a user visits the site and receives one of the two URLs, persist which URL is chosen in a cookie so that they always see the same variant when they return to the application.

### 3. Publish to a domain

Was not able to do this as the only Cloudflare access I have is restricted to company domain.
