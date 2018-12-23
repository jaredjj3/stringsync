import * as React from 'react';
import { Lane } from '../../components/lane';
import { Box } from '../../components/box';
import { Row } from 'antd';
import { componentFromProp } from 'recompose';

export const Privacy = () => (
  <Lane withTopMargin={true}>
    <Row type="flex" justify="center">
      <Box title="privacy">
        <p>This privacy policy sets out how “StringSync” uses and protects any information that you give “StringSync” when you use this website. “StringSync” is committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, then you can be assured that it will only be used in accordance with this privacy statement. “StringSync” may change this policy from time to time by updating this page. You should check this page from time to time to ensure that you are happy with any changes. This policy is effective from January 1, 2019.</p>

        <h1>what we collect</h1>
        <p>We may collect the following information:</p>
        <ul>
          <li>name</li>
          <li>contact information including email address</li>
          <li>demographic information such as postcode, preferences and interests</li>
          <li>other information relevant to customer surveys and/or offers</li>
        </ul>
        <h1>What we do with the information we gather</h1>
        <p>We require this information to understand your needs and provide you with a better service, and in particular for the following reasons:</p>

        <h1>internal record keeping</h1>
        <p>We may use the information to improve our products and services.</p>
        <p>We may periodically send promotional email about new products, special offers or other information which we think you may find interesting using the email address which you have provided. </p>
        <p>From time to time, we may also use your information to contact you for market research purposes. We may contact you by email, phone, fax or mail.</p>
        <p>We may use the information to customize the website according to your interests.</p>
        <p>We may provide your information to our third party partners for marketing or promotional purposes.</p>
        <p>We will never sell your information.</p>

        <h1>security</h1>
        <p>We are committed to ensuring that your information is secure. In order to prevent unauthorized access or disclosure we have put in place suitable physical, electronic and managerial procedures to safeguard and secure the information we collect online.</p>

        <h1>How we use cookies</h1>
        <p>A cookie is a small file which asks permission to be placed on your computer's hard drive. Once you agree, the file is added and the cookie helps analyze web traffic or lets you know when you visit a particular site. Cookies allow web applications to respond to you as an individual. The web application can tailor its operations to your needs, likes and dislikes by gathering and remembering information about your preferences.</p>
        <p>We use traffic log cookies to identify which pages are being used. This helps us analyze data about web page traffic and improve our website in order to tailor it to customer needs. We only use this information for statistical analysis purposes and then the data is removed from the system.</p>
        <p>Overall, cookies help us provide you with a better website, by enabling us to monitor which pages you find useful and which you do not. A cookie in no way gives us access to your computer or any information about you, other than the data you choose to share with us. </p>
        <p>You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. This may prevent you from taking full advantage of the website.</p>

        <h1>links to other websites</h1>
        <p>Our website may contain links to enable you to visit other websites of interest easily. However, once you have used these links to leave our site, you should note that we do not have any control over that other website. Therefore, we cannot be responsible for the protection and privacy of any information which you provide whilst visiting such sites and such sites are not governed by this privacy statement. You should exercise caution and look at the privacy statement applicable to the website in question.</p>
      </Box>
    </Row>
  </Lane>
);
