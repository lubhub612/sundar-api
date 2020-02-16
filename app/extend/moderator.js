'use strict'

const moderator = function() {
}

moderator.checkText = async (ctx, text) => {

  const result = await ctx.curl(ctx.app.config.azure_moderator.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'Ocp-Apim-Subscription-Key': ctx.app.config.azure_moderator.key,
    },
    data: {
      text,
    },
    dataType: 'json',
  })

  return result.data
}

module.exports = moderator

