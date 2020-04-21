addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
})

const VARIANTS_URL = 'https://cfw-takehome.developers.workers.dev/api/variants';

/**
 * Responds with a random page from our constant VARIANTS_URL response
 * Handles 500 error if there is an issue with our data from VARIANTS_URL
 */
async function handleRequest(request) {
  const cookies = getCookies(request.headers.get('Cookie'));
  const cookieVariantUrl = cookies['variant'];

  const res = await fetch(VARIANTS_URL);
  if (res.ok) {
    const data = await res.json();
    
    // Check for variants field and length
    if (data.variants && data.variants.length && data.variants.length > 0) {
      // Check if our given cookie variant URL is included for security reasons (don't want peopel requesting a random URL via cookie modification)
      const variantUrl = cookieVariantUrl && data.variants.includes(cookieVariantUrl) ? cookieVariantUrl : chooseRandom(data.variants);
      const variantResponse = await fetch(variantUrl);
      const response = addVariantCookie(variantResponse, variantUrl)
      return modifyResponse(response);
    }
  }

  // We only hit this if !res.ok or data.variants is invalid
  return new Response('An internal error occurred', {
    headers: { 
      'content-type': 'text/plain'
    },
    status: 500,
    statusText: 'Internal Server Error'
  })
}

/**
 * Parses cookie string into an object
 * @param cookieString Cookies from string given in headers
 */
function getCookies(cookieString) {
  const cookies = {};
  cookieString && cookieString.split(';').forEach((cookie) =>{
    const parts = cookie.match(/(.*?)=(.*)$/)
    cookies[ parts[1].trim() ] = (parts[2] || '').trim();
  });
  return cookies;
};

/**
 * Chooses a random element from the array
 * If the array is empty, will return undefined
 * @param array array to choose random from
 */
function chooseRandom(array) {
  if (array.length == 0) {
    return undefined;
  }

  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

function addVariantCookie(response, variantUrl) {
  // Make the headers mutable by re-constructing the Response.
  const modifiedResponse = new Response(response.body, response)
  modifiedResponse.headers.set('Set-Cookie', `variant=${variantUrl}`);

  return modifiedResponse;
}

class TitleRewriter {
  /**
   * Modifies the title element of page
   * @param element element to modify
   */
  element(element) {
    element.setInnerContent('Your Variant!')
  }
}

class PrependTextRewriter {
  buffer;
  regexMatch;
  prependText;

  constructor(regexMatch, prependText) {
    this.regexMatch = regexMatch;
    this.prependText = prependText;
    this.buffer = '';
  }

  /**
   * Adds prepend text before the regex we're looking for
   * i.e. 'Variant X' -> 'Variant #X' where we match X and prepend '#'
   * @param textChunk text we're processing 
   */
  text(textChunk) {
    this.buffer += textChunk.text;

    if (textChunk.lastInTextNode) {
      // Replace last text chunk with our modified version of the whole node
      textChunk.replace(this.buffer.replace(this.regexMatch, `${this.prependText}$1`))
      this.buffer = '';
    } else {
      // Remove text chunk if its not the last one.
      textChunk.remove(); 
    }
  }
}

class URLRewriter {
  buffer = '';

  /**
   * Changes the link to my LinkedIn (which also links to my GitHub and side project/company :) )
   * @param element element to process
   */
  element(element) {
    element.setAttribute('href', 'https://www.linkedin.com/in/linaresfelipe/')
  }

  /**
   * Modifies the text of the element to my custom text
   * @param textChunk textChunk to process
   */
  text(textChunk) {
    this.buffer += textChunk.text;

    if (textChunk.lastInTextNode) {
      textChunk.replace('Check out my Projects and Experience!')
      this.buffer = '';
    } else {
      textChunk.remove(); 
    }
  }
}

/**
 * Rewriter to modify our outgoing HTML response
 */
const HTML_REWRITER = new HTMLRewriter() 
  .on('title', new TitleRewriter())
  .on('h1#title', new PrependTextRewriter(/(\d)/g, '#'))
  .on('p#description', new PrependTextRewriter(/((one)|(two))/, 'number '))
  .on('a#url', new URLRewriter());

/**
 * Modifies a response given our html rewriter
 * @param response response to modify
 */
function modifyResponse(response) {
  return HTML_REWRITER.transform(response);
}