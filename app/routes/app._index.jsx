import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation, useParams, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  VerticalStack,
  Card,
  Button,
  HorizontalStack,
  Box,
  Divider,
  List,
  Link,
} from "@shopify/polaris";
import db from '../db.server'
import { authenticate } from "../shopify.server";


export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const {session } = await authenticate.admin(request);
  const {shop} = session

  // return null
  const isSaved = await db.themeId.findFirst({
    where: {
      shop
    }
  })
  
  if(isSaved) {
    return {value: isSaved.contentCartDrawer, id: Number(isSaved.theme_id)}
  }
  const theme = await admin.rest.resources.Theme.all({
    session: session,
    role: 'main'
  })
  if(theme.data[0].theme_store_id !== 887) {
    return `Your theme is not available, please get theme 'Dawn'`
  }
  const cartDrawer = await admin.rest.resources.Asset.all({
    session,
    theme_id: theme.data[0].id,
    asset: {
      key: "snippets/cart-drawer.liquid"
    }
  })

  const register = await db.themeId.create({
    data: {
      shop,
      theme_id: theme.data[0].id,
      contentCartDrawer: cartDrawer.data[0].value
    }
  })
  return {value: cartDrawer.data[0].value, id: Number(theme.data[0].id)}
}


///////////////////////////////////////////////////////




export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const { admin } = await authenticate.admin(request);
  const data = await request.formData()
  const id = parseInt(data.get('id'))
  try{
    const template = await getTemplate()
    const asset = await updateCartFile(admin, session, "snippets/cart-drawer.liquid", template, id)
    console.log(asset)
  } catch (e) {
    console.error(e)
  }
 
  
  return null
}


///////////////////////////////////////////////


/**
 * 
 * @param {*} admin 
 * @param {*} session 
 * @param {String} path 
 * @param {String} content 
 * @param {Number} theme_id 
 * @returns 
 */
async function updateCartFile(admin, session, path, content, theme_id) {
  const asset = new admin.rest.resources.Asset({session})
  asset.theme_id = theme_id
  asset.key = path
  asset.value = content
  await asset.save({update:true})
}
async function getTemplate() {
  const template = await db.superCart.findUnique({where: {id :  1}})
  if(template === null) throw new Error('Template not found')
  const code = (`${template.title} \n ${template.option1} \n ${template.form} \n ${template.option2} \n ${template.total} \n ${template.option3} \n ${template.footer}`)
  return code
}

///////////////////////////////////////////////////////


export default function Index() {
  // const nav = useNavigation();
  const data = useLoaderData()
  const submit = useSubmit();
  const activeSuperCart = () => submit({id: data.id}, {method: 'PUT'})
  const activeNull = () => submit({}, {method:'PUT'})
  console.log(data)
  return (
    <Page>
      <ui-title-bar title="Your customized cart!">
        <button variant="primary" onClick={activeSuperCart}>
          Activate Super Cart!
        </button>
      </ui-title-bar>
      <VerticalStack gap="5">
        <Layout>
          <Layout.Section>
            <Card>
              <VerticalStack gap="5">
                <VerticalStack gap="2">
                  <Text as="h2" variant="headingMd">
                    OK
                  </Text>
                  <Text variant="bodyMd" as="p">
                  </Text>
                </VerticalStack>
                <VerticalStack gap="2">
                  <Text as="h3" variant="headingMd">
                    Get started with products
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Generate a product with GraphQL and get the JSON output for
                    that product. Learn more about the{" "}
                    <Link
                      url="https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate"
                      target="_blank"
                    >
                      productCreate
                    </Link>{" "}
                    mutation in our API references.
                  </Text>
                </VerticalStack>
              </VerticalStack>
            </Card>
          </Layout.Section>
        </Layout>
      </VerticalStack>
    </Page>
  );
}
