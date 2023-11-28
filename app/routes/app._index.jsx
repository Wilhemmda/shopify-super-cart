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

  
  return null
}


///////////////////////////////////////////////////////




export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const { admin } = await authenticate.admin(request);
  const {shop} = session
  return null
}

///////////////////////////////////////////////////////

export default function Index() {
  // const nav = useNavigation();
  const data = useLoaderData()
  const submit = useSubmit();
  const activeSuperCart = () => submit({action:"active", id: data.id}, {method: 'PUT'})
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
                  <Button size='large' onClick={()=>submit({action:'addexample', id: data.id}, {method:'PUT'})}>Add Free Shipping text</Button>
                </VerticalStack>
              </VerticalStack>
            </Card>
          </Layout.Section>
        </Layout>
      </VerticalStack>
    </Page>
  );
}
