import { useCallback, useEffect, useState } from "react";
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
  TextField,
  Form,
  FormLayout,
  Checkbox,
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
  const data = await request.formData()
  console.log(data)
  return null
}

///////////////////////////////////////////////////////

export default function Index() {
  // const nav = useNavigation();
  const data = useLoaderData()
  const submit = useSubmit();


  const [textFieldValue, setTextFieldValue] = useState('Free truc');
  const handleTextFieldChange = useCallback(
    (value) => setTextFieldValue(value),
    [],
  );
  const handleChange = useCallback((value) => setTextFieldValue(value), []);
  const handleSubmit = useCallback(() => {
    setTextFieldValue('');
    try {
      const response = submit(
        { textFieldValue },
        {
          method: 'POST',
          replace: true,
        }
      );
      setTextFieldValue('Free truc');
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire :', error);
    }
  }, []);
  
  useEffect(() => {
    if (textFieldValue !== 'Free truc') {
      handleSubmit();
    }
  }, [textFieldValue, handleSubmit]);
  return (
    <Page>
      <ui-title-bar title="Your customized cart!">
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
                  <Form onSubmit={handleSubmit}>
                    <FormLayout>
                      <TextField
                        label="Phrase"
                        value={textFieldValue}
                        onChange={handleChange}
                        clearButton                        
                        autoComplete="off"
                        helpText={
                          <span>
                            Write some text, try 'Free Shipping!'
                          </span>
                        }
                      />
                      <Button submit>Submit</Button>
                    </FormLayout>
                  </Form>

                </VerticalStack>
              </VerticalStack>
            </Card>
          </Layout.Section>
        </Layout>
      </VerticalStack>
    </Page>
  );
}
