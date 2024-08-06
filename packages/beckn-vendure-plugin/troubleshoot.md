# Troubleshooting guide for beckn-vendure-plugin

## Introduction

This document helps developers who use the beckn-vendure-plugin to troubleshoot beckn messages and responses.

## Design

The following is a brief introduction on the way the beckn-vendure-plugin is designed. Initially when we started the project there were certain requirements that required us to develop this in a way that it would not require code change to implement new flows and changes in existing flows. In order to faciliatate this requirement, the plugin was designed to be something that sits outside of vendure. So it does not use vendure services, but instead relies entirely on vendure Graphql APIs. This is a choice I have come to deeply regret. The following are some of the reasons why this is a bad design.
a. Even though there might not be typescript change required for new flows, there is a change required in jsonata. Though we can use the tool provided by try.jsonata.org to experiment and come up with the right transformation script, jsonata itself is not very friendly for javascript/typescript developers. It is almost a language of its own. My guess is experienced vendure plugin developers would have been much more comfortable with Typescript code than this transformation engine approach
b. While for most cases we do not require change in typescript code, if we require a functionality that is not covered by the existing shop and admin graphql api, then we still need to write resolvers, services etc. So we have not really achieved a great deal with this design.
c. The whole process of troubleshooting and debugging is difficult. This guide will go some way in solving this problem, but a native plugin design would not have required this guide in the first place.

So much I was disillusioned with the design, I started a new project one weekend to write a native plugin. Conceptually it works. However due to the way Vendure depends on the Appolo middleware, it has a bit of complexity. I never got the go ahead for the week or so of time required for the new plugin and it stays languishing in the folder (beckn-plugin)

Anyways, with that out of the way, let us go ahead and understand the design of the current plugin. Here are some salient features

1. There is a transformer class that has only three tasks
   a. Send GrapQL request - It sends a graphql request and adds the response to the holdall (explained below)
   b. Send multiple graphql requests - It sends multiple graphql requests and adds the responses to the holdall
   c. Transform and add - Applies a jsonata transformation to the holdall and adds its output again to the holdall

2. From the moment a Beckn request arrives, we create a empty object (called as holdall above) and we add the beckn request.
3. Based on the beckn request version, there are transformations-x-y-z.json file which has a list of tasks to run for that request. This of this as the recipe.
4. As we run the task (which is one of the above three types), we keep adding outputs to the holdall.
5. The last step of the recipe will be to send the Beckn response back.
6. Some small implementation choices (in order to avoid repitition in recipe)
   a. If there is a key called `vendureAuthToken` then it is set as header for the graphQL query. This is the shortcut to maintain state. Beckn is a stateless protocol. Hence we need to maintain a table to translate the order/transaction id to the auth token.
   b. If there is a key called `vendureToken`, then it is set as the channel code in the header. Check these two keys in the code for details on the implementation.

That is it. This is the design of the app. Any change in flow will be achieved by modifying steps in the recipe.

## Troubleshooting

To troubleshoot an error you get in Beckn processing, do the following:

1. In the src/constants.ts, there is a TROUBLESHOOTING_MODE flag. Set it to true.
2. Now run the request from postman or your UI.
3. The console output will contain a lot of info. Copy from the console and paste it in an editor that allows json collapse. (You might have to remove a few lines in the top and bottom to see the actual JSON holdall)
4. Open the transformations/transformations-1-1-0.json(currently it is version 1.1.0 of beckn) and traverse to the beckn action (e.g. search, select, init etc). There you will see a list of json objects, one each for the task. For example, the following is an example of a task definition. The type will be one of three task types mentioned in the design section. The name is not very relevant. The arguments specify the data required for task execution (e.g. here jsonata filename, output key and whether the task is something shared by multiple actions). You can open the jsonata and see the transformations that this task will apply.

```
{
    "name": "construct-beckn-response-context",
    "type": "transform-and-add",
    "args": {
        "jsonataFilename": "construct-beckn-response-context.jsonata",
        "outputKey": "becknResponseContext",
        "common": "true"
    }
}
```

5. Now if you carefully go through the holdall, you will see that gradually the tasks are run and the holdall is extended with the task output. One of the outputs will be not correct and you will have to figure out why.
6. If it is a graphql that has gone wrong, the error is directly displayed. If a graphql call has failed because its input was wrong, you will have to see why the input key in the holdall has the wrong data. Most probably it would be because the value for the key is wrongly constructed due to a previous transformation.
7. The easiest way to debug the jsonata transformations is to use the try.jsonata.org site. Paste the holdall json on the left hand side. Paste the transformation jsonata(from the jsonataFile mentioned in the transformation task) on the top right. The bottom right will show the output. This will be added to the holdall with the key as outputKey

Using the above process you can debug what is wrong.

## Troubleshooting using test suite

1. Let us say you want to troubleshoot `select` request. Check the `src/plugins/beckn-vendure-plugin/e2e/fixtures/beckn-requests/1-1-0/select.json`. This is the request that is used for the test. You can modify it if your test requires it.
2. In the `src/plugins/beckn-vendure-plugin/e2e/fixtures/test-configurations/1-1-0.json` copy the select request and paste it at the end of the array (In troubleshooting mode, only the last test is executed)
3. In the `src/plugins/beckn-vendure-plugin/src/constants.ts`, there is a TROUBLESHOOTING_MODE flag. Set it to true.
4. Run `npm run watch` within the src/plugins/beckn-vendure-plugin folder.
5. In a separate tab, `npm run dev` in the root vendure folder.
6. In a third tab, `npm run test` within the src/plugins/beckn-vendure-plugin folder.
7. This will run the last test (select) and output the holdall at every stage on the screen.
8. Use this to identify the source of error as described in the section above.
9. Here is a sample holdall for select when it has run successfully. Here are some important keys
   a. The `env` key shows the environment
   b. The `becknRequest` key shows the incoming request
   c. The `requestEnv` key shows the environment specific to this request
   d. The `tasksDefList` key lists the task that are applied one after another
   e. The `becknResponseContext` key prepares the context for response
   f. The rest of the keys are generated by the select recipe
   g. The `becknResponse` key is the response key

```
{
  "env": {
    "host_url": "http://localhost:3000",
    "bpp_id": "vbabu.lr.bpp.1",
    "bpp_uri": "https://vbabu-lr-bpp.loca.lt",
    "bpp_country": "IND",
    "bpp_city": "std:080",
    "transformationsFolder": "/Users/venkatesh/work/vendure/dev/src/plugins/beckn-vendure-plugin/transformations",
    "versionTransformationsConfigFile": "/Users/venkatesh/work/vendure/dev/src/plugins/beckn-vendure-plugin/transformations/version-map.json"
  },
  "becknRequest": {
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "context": {
        "domain": "retail:1.1.0",
        "location": {
          "country": {
            "code": "IND"
          },
          "city": {
            "code": "std:080"
          }
        },
        "action": "select",
        "version": "1.1.0",
        "bap_id": "ps-bap-network.becknprotocol.io",
        "bap_uri": "https://ps-bap-network.becknprotocol.io/",
        "bpp_id": "vbabu.lr.bpp.1",
        "bpp_uri": "https://vbabu-lr-bpp.loca.lt",
        "message_id": "9ac8d574-16ff-402e-beb7-d374b0edb352",
        "transaction_id": "0959beb6-5906-4416-9951-ad8b0406316f",
        "timestamp": "2024-08-06T17:39:19.229Z",
        "ttl": "PT10M"
      },
      "message": {
        "order": {
          "provider": {
            "id": "2p0aliran34hu8i6cr7y"
          },
          "items": [
            {
              "id": "69",
              "quantity": {
                "selected": {
                  "count": 2
                }
              }
            },
            {
              "id": "70",
              "quantity": {
                "selected": {
                  "count": 1
                }
              }
            }
          ]
        }
      }
    }
  },
  "requestEnv": {
    "version": "1.1.0",
    "action": "select",
    "versionConfigFile": "/Users/venkatesh/work/vendure/dev/src/plugins/beckn-vendure-plugin/transformations/transformations-1-1-0.json",
    "versionSupportFilesFolder": "/Users/venkatesh/work/vendure/dev/src/plugins/beckn-vendure-plugin/transformations/actions-1-1-0"
  },
  "tasksDefList": [
    {
      "name": "construct-beckn-response-context",
      "type": "transform-and-add",
      "args": {
        "jsonataFilename": "construct-beckn-response-context.jsonata",
        "outputKey": "becknResponseContext",
        "common": "true"
      }
    },
    {
      "name": "get-provider-id",
      "type": "transform-and-add",
      "args": {
        "jsonataFilename": "extract-provider-id-from-order-request.jsonata",
        "outputKey": "vendureToken",
        "common": "true"
      }
    },
    {
      "name": "extract-transaction-id",
      "type": "transform-and-add",
      "args": {
        "jsonataFilename": "extract-transaction-id-from-beckn.jsonata",
        "outputKey": "becknTransactionId",
        "common": "true"
      }
    },
    {
      "name": "get-existing-beckn-transaction",
      "type": "send-graphql-request",
      "args": {
        "graphqlFilename": "getBecknTransaction.graphql",
        "variablesKey": "becknTransactionId",
        "outputDataPath": "body.data.getBecknTransaction.vendureAuthToken",
        "outputKey": "vendureAuthToken"
      }
    },
    {
      "name": "set-existing-auth-token",
      "type": "transform-and-add",
      "args": {
        "jsonataFilename": "check-if-vendure-auth-token-exists.jsonata",
        "outputKey": "usingExistingVendureAuthToken",
        "common": "true"
      }
    },
    {
      "name": "erase-existing-cart",
      "type": "send-graphql-request",
      "args": {
        "graphqlFilename": "removeAllOrderLines.graphql",
        "outputKey": "removeAllOrderLinesResult",
        "outputDataPath": "body.data"
      },
      "condition": "context.usingExistingVendureAuthToken"
    },
    {
      "name": "extract-select-params",
      "type": "transform-and-add",
      "args": {
        "jsonataFilename": "select-beckn-request.jsonata",
        "outputKey": "cartDetails"
      }
    },
    {
      "name": "add-first-item-to-order",
      "type": "send-graphql-request",
      "args": {
        "graphqlFilename": "addItemToOrder.graphql",
        "variablesKey": "cartDetails.firstItem",
        "outputKey": "responseWithVendureAuthToken"
      }
    },
    {
      "name": "extract-vendure-auth-token",
      "type": "transform-and-add",
      "args": {
        "jsonataFilename": "extract-vendure-auth-token-from-graphql-response.jsonata",
        "outputKey": "vendureAuthToken",
        "common": "true"
      },
      "condition": "!context.usingExistingVendureAuthToken"
    },
    {
      "name": "add-remaining-items-to-order",
      "type": "send-multiple-graphql-requests",
      "args": {
        "graphqlFilename": "addItemToOrder.graphql",
        "variablesKey": "cartDetails.restItems",
        "outputKey": "addRestItemsToOrderResponse"
      },
      "condition": "context.cartDetails.totalItems > 1"
    },
    {
      "name": "form-beckn-transaction-variables",
      "type": "transform-and-add",
      "args": {
        "jsonataFilename": "form-beckn-transaction-variables.jsonata",
        "common": "true",
        "outputKey": "addBecknTransactionVariables"
      },
      "condition": "!context.usingExistingVendureAuthToken"
    },
    {
      "name": "add-beckn-transaction",
      "type": "send-graphql-request",
      "args": {
        "graphqlFilename": "addBecknTransaction.graphql",
        "variablesKey": "addBecknTransactionVariables",
        "outputKey": "addBecknTransactionOutput"
      },
      "condition": "!context.usingExistingVendureAuthToken"
    },
    {
      "name": "get-current-order",
      "type": "send-graphql-request",
      "args": {
        "graphqlFilename": "activeOrderOnSelect.graphql",
        "outputKey": "currentOrderResponse"
      }
    },
    {
      "name": "get-current-seller",
      "type": "send-graphql-request",
      "args": {
        "graphqlFilename": "currentSeller.graphql",
        "outputKey": "currentSellerResponse"
      }
    },
    {
      "name": "get-eligible-shipping-methods",
      "type": "send-graphql-request",
      "args": {
        "graphqlFilename": "eligibleShippingMethods.graphql",
        "outputKey": "eligibleShippingMethods",
        "outputDataPath": "body.data.eligibleShippingMethods"
      }
    },
    {
      "name": "generate-beckn-response",
      "type": "transform-and-add",
      "args": {
        "jsonataFilename": "on-select-beckn-response.jsonata",
        "outputKey": "becknResponse"
      }
    }
  ],
  "becknResponseContext": {
    "domain": "retail:1.1.0",
    "location": {
      "country": {
        "code": "IND"
      },
      "city": {
        "code": "std:080"
      }
    },
    "action": "on_select",
    "version": "1.1.0",
    "bap_id": "ps-bap-network.becknprotocol.io",
    "bap_uri": "https://ps-bap-network.becknprotocol.io/",
    "bpp_id": "vbabu.lr.bpp.1",
    "bpp_uri": "https://vbabu-lr-bpp.loca.lt",
    "message_id": "9ac8d574-16ff-402e-beb7-d374b0edb352",
    "transaction_id": "0959beb6-5906-4416-9951-ad8b0406316f",
    "timestamp": "2024-08-06T17:39:19.230Z",
    "ttl": "PT10M"
  },
  "vendureToken": "2p0aliran34hu8i6cr7y",
  "becknTransactionId": {
    "becknTransactionId": "0959beb6-5906-4416-9951-ad8b0406316f|ps-bap-network.becknprotocol.io"
  },
  "vendureAuthToken": "6b321411ae9db56997675a0a49425a0a7bbd53d1da6e6754965d94f87b45ce18",
  "usingExistingVendureAuthToken": false,
  "cartDetails": {
    "totalItems": 2,
    "firstItem": {
      "productVariantId": "69",
      "quantity": 2
    },
    "restItems": [
      {
        "productVariantId": "70",
        "quantity": 1
      }
    ]
  },
  "responseWithVendureAuthToken": {
    "headers": {
      "x-powered-by": "Express",
      "vary": "Origin",
      "access-control-allow-credentials": "true",
      "access-control-expose-headers": "vendure-auth-token",
      "content-language": "en",
      "vendure-auth-token": "6b321411ae9db56997675a0a49425a0a7bbd53d1da6e6754965d94f87b45ce18",
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      "content-length": "41",
      "etag": "W/\"29-n2SG3NrMUIl3wNPdj1D9nZBz4u0\"",
      "set-cookie": "session=eyJ0b2tlbiI6IjZiMzIxNDExYWU5ZGI1Njk5NzY3NWEwYTQ5NDI1YTBhN2JiZDUzZDFkYTZlNjc1NDk2NWQ5NGY4N2I0NWNlMTgifQ==; path=/; expires=Wed, 06 Aug 2025 23:39:19 GMT; samesite=lax; httponly,session.sig=6DzPsxBnFVuSDXU_fSYwfCHsMWE; path=/; expires=Wed, 06 Aug 2025 23:39:19 GMT; samesite=lax; httponly",
      "date": "Tue, 06 Aug 2024 17:39:19 GMT",
      "connection": "keep-alive",
      "keep-alive": "timeout=5"
    },
    "body": {
      "data": {
        "addItemToOrder": {
          "id": "726"
        }
      }
    }
  },
  "addRestItemsToOrderResponse": [
    {
      "headers": {
        "x-powered-by": "Express",
        "vary": "Origin",
        "access-control-allow-credentials": "true",
        "access-control-expose-headers": "vendure-auth-token",
        "content-language": "en",
        "cache-control": "no-store",
        "content-type": "application/json; charset=utf-8",
        "content-length": "41",
        "etag": "W/\"29-n2SG3NrMUIl3wNPdj1D9nZBz4u0\"",
        "date": "Tue, 06 Aug 2024 17:39:19 GMT",
        "connection": "keep-alive",
        "keep-alive": "timeout=5"
      },
      "body": {
        "data": {
          "addItemToOrder": {
            "id": "726"
          }
        }
      }
    }
  ],
  "addBecknTransactionVariables": {
    "becknTransactionId": "0959beb6-5906-4416-9951-ad8b0406316f|ps-bap-network.becknprotocol.io",
    "vendureAuthToken": "6b321411ae9db56997675a0a49425a0a7bbd53d1da6e6754965d94f87b45ce18"
  },
  "addBecknTransactionOutput": {
    "headers": {
      "x-powered-by": "Express",
      "vary": "Origin",
      "access-control-allow-credentials": "true",
      "access-control-expose-headers": "vendure-auth-token",
      "content-language": "en",
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      "content-length": "302",
      "etag": "W/\"12e-0zUfwpOJXfhnYzlUG56OIQSqwQ8\"",
      "date": "Tue, 06 Aug 2024 17:39:19 GMT",
      "connection": "keep-alive",
      "keep-alive": "timeout=5"
    },
    "body": {
      "data": {
        "addBecknTransaction": {
          "id": "640",
          "createdAt": "2024-08-06T17:39:19.000Z",
          "updatedAt": "2024-08-06T17:39:19.000Z",
          "becknTransactionId": "0959beb6-5906-4416-9951-ad8b0406316f|ps-bap-network.becknprotocol.io",
          "vendureAuthToken": "6b321411ae9db56997675a0a49425a0a7bbd53d1da6e6754965d94f87b45ce18"
        }
      }
    }
  },
  "currentOrderResponse": {
    "headers": {
      "x-powered-by": "Express",
      "vary": "Origin",
      "access-control-allow-credentials": "true",
      "access-control-expose-headers": "vendure-auth-token",
      "content-language": "en",
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      "content-length": "1322",
      "etag": "W/\"52a-IireyzyWKEJBoTW6EzD1kuinJ3c\"",
      "date": "Tue, 06 Aug 2024 17:39:19 GMT",
      "connection": "keep-alive",
      "keep-alive": "timeout=5"
    },
    "body": {
      "data": {
        "activeOrder": {
          "subTotal": 4689,
          "currencyCode": "USD",
          "total": 4689,
          "totalWithTax": 5627,
          "lines": [
            {
              "unitPrice": 1995,
              "unitPriceWithTax": 2394,
              "quantity": 2,
              "linePrice": 3990,
              "linePriceWithTax": 4788,
              "productVariant": {
                "id": "69",
                "name": "Hanging Plant",
                "product": {
                  "description": "Can be found in tropical and sub-tropical America where it grows on the branches of trees, but also on telephone wires and electricity cables and poles that sometimes topple with the weight of these plants. This plant loves a moist and warm air.",
                  "assets": [
                    {
                      "source": "http://localhost:3000/assets/source/ff/alex-rodriguez-santibanez-200278-unsplash.jpg"
                    }
                  ]
                },
                "assets": []
              },
              "customFields": {
                "startTime": null,
                "endTime": null
              }
            },
            {
              "unitPrice": 699,
              "unitPriceWithTax": 839,
              "quantity": 1,
              "linePrice": 699,
              "linePriceWithTax": 839,
              "productVariant": {
                "id": "70",
                "name": "Aloe Vera",
                "product": {
                  "description": "Decorative Aloe vera makes a lovely house plant. A really trendy plant, Aloe vera is just so easy to care for. Aloe vera sap has been renowned for its remarkable medicinal and cosmetic properties for many centuries and has been used to treat grazes, insect bites and sunburn - it really works.",
                  "assets": [
                    {
                      "source": "http://localhost:3000/assets/source/d5/silvia-agrasar-227575-unsplash.jpg"
                    }
                  ]
                },
                "assets": []
              },
              "customFields": {
                "startTime": null,
                "endTime": null
              }
            }
          ]
        }
      }
    }
  },
  "currentSellerResponse": {
    "headers": {
      "x-powered-by": "Express",
      "vary": "Origin",
      "access-control-allow-credentials": "true",
      "access-control-expose-headers": "vendure-auth-token",
      "content-language": "en",
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      "content-length": "565",
      "etag": "W/\"235-Ig9ttCY468WDii5bYQ8F+RBfKPM\"",
      "date": "Tue, 06 Aug 2024 17:39:19 GMT",
      "connection": "keep-alive",
      "keep-alive": "timeout=5"
    },
    "body": {
      "data": {
        "activeChannel": {
          "id": "1",
          "code": "__default_channel__",
          "token": "2p0aliran34hu8i6cr7y",
          "customFields": null,
          "seller": {
            "id": "1",
            "createdAt": "2024-01-30T03:11:55.000Z",
            "updatedAt": "2024-02-26T02:37:48.000Z",
            "name": "Default Seller",
            "customFields": {
              "shortDescription": "Marketplace for agricultural products in Kenya",
              "longDescription": "Marketplace to Buy and Sell Agricultural Products and Services in Kenya",
              "phoneNumber": "+254786570610",
              "email": "default.seller@email.com",
              "url": "https://default-seller.example.com",
              "address": null,
              "taxId": null,
              "images": []
            }
          }
        }
      }
    }
  },
  "eligibleShippingMethods": [
    {
      "id": "4",
      "code": "standard",
      "name": "Standard"
    },
    {
      "id": "6",
      "code": "standard",
      "name": "Standard"
    },
    {
      "id": "1",
      "code": "standard-shipping",
      "name": "Standard Shipping"
    },
    {
      "id": "2",
      "code": "express-shipping",
      "name": "Express Shipping"
    }
  ],
  "becknResponse": {
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "context": {
        "domain": "retail:1.1.0",
        "location": {
          "country": {
            "code": "IND"
          },
          "city": {
            "code": "std:080"
          }
        },
        "action": "on_select",
        "version": "1.1.0",
        "bap_id": "ps-bap-network.becknprotocol.io",
        "bap_uri": "https://ps-bap-network.becknprotocol.io/",
        "bpp_id": "vbabu.lr.bpp.1",
        "bpp_uri": "https://vbabu-lr-bpp.loca.lt",
        "message_id": "9ac8d574-16ff-402e-beb7-d374b0edb352",
        "transaction_id": "0959beb6-5906-4416-9951-ad8b0406316f",
        "timestamp": "2024-08-06T17:39:19.230Z",
        "ttl": "PT10M"
      },
      "message": {
        "order": {
          "id": "6b321411ae9db56997675a0a49425a0a7bbd53d1da6e6754965d94f87b45ce18",
          "provider": {
            "id": "2p0aliran34hu8i6cr7y",
            "descriptor": {
              "name": "Default Seller",
              "short_desc": "Marketplace for agricultural products in Kenya",
              "long_desc": "Marketplace to Buy and Sell Agricultural Products and Services in Kenya"
            },
            "tags": [
              {
                "display": true,
                "descriptor": {
                  "name": "Additional Details",
                  "code": "additional_details",
                  "short_desc": "Additional details about seller"
                },
                "list": []
              }
            ]
          },
          "fulfillments": [
            {
              "id": "4",
              "type": "standard"
            },
            {
              "id": "6",
              "type": "standard"
            },
            {
              "id": "1",
              "type": "standard-shipping"
            },
            {
              "id": "2",
              "type": "express-shipping"
            }
          ],
          "items": [
            {
              "id": "69",
              "descriptor": {
                "name": "Hanging Plant",
                "long_desc": "Can be found in tropical and sub-tropical America where it grows on the branches of trees, but also on telephone wires and electricity cables and poles that sometimes topple with the weight of these plants. This plant loves a moist and warm air.",
                "images": [
                  {
                    "url": "http://localhost:3000/assets/source/ff/alex-rodriguez-santibanez-200278-unsplash.jpg"
                  }
                ]
              },
              "price": {
                "listed_value": "19.95",
                "currency": "USD",
                "value": "19.95"
              },
              "quantity": {
                "selected": {
                  "count": 2
                }
              },
              "fulfillment_ids": [
                "1",
                "2",
                "4",
                "6"
              ]
            },
            {
              "id": "70",
              "descriptor": {
                "name": "Aloe Vera",
                "long_desc": "Decorative Aloe vera makes a lovely house plant. A really trendy plant, Aloe vera is just so easy to care for. Aloe vera sap has been renowned for its remarkable medicinal and cosmetic properties for many centuries and has been used to treat grazes, insect bites and sunburn - it really works.",
                "images": [
                  {
                    "url": "http://localhost:3000/assets/source/d5/silvia-agrasar-227575-unsplash.jpg"
                  }
                ]
              },
              "price": {
                "listed_value": "6.99",
                "currency": "USD",
                "value": "6.99"
              },
              "quantity": {
                "selected": {
                  "count": 1
                }
              },
              "fulfillment_ids": [
                "1",
                "2",
                "4",
                "6"
              ]
            }
          ],
          "quote": {
            "price": {
              "currency": "USD",
              "value": "56.27"
            },
            "breakup": [
              {
                "title": "base-price",
                "price": {
                  "currency": "USD",
                  "value": "46.89"
                }
              },
              {
                "title": "taxes",
                "price": {
                  "currency": "USD",
                  "value": "9.38"
                }
              }
            ]
          },
          "type": "DEFAULT",
          "tags": [
            {
              "descriptor": {
                "name": "Shipping method details",
                "code": "ShippingMethodDetails"
              },
              "list": [
                {
                  "descriptor": {
                    "name": "Standard",
                    "code": "standard"
                  },
                  "value": "standard"
                },
                {
                  "descriptor": {
                    "name": "Standard",
                    "code": "standard"
                  },
                  "value": "standard"
                },
                {
                  "descriptor": {
                    "name": "Standard Shipping",
                    "code": "standard-shipping"
                  },
                  "value": "standard-shipping"
                },
                {
                  "descriptor": {
                    "name": "Express Shipping",
                    "code": "express-shipping"
                  },
                  "value": "express-shipping"
                }
              ]
            }
          ]
        }
      }
    }
  }
}

```
