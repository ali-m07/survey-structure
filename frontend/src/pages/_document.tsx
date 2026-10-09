import Document, { Html, Head, Main, NextScript } from "next/document";
export default class PorsnamaDocument extends Document {
  render() {
    const locale = this.props.__NEXT_DATA__.locale || "fa";
    return (
      <Html lang={locale} dir={locale === "fa" ? "rtl" : "ltr"}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
