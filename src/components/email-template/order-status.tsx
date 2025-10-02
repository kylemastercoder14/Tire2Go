/* eslint-disable react/no-unescaped-entities */
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  render,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { OrderWithOrderItem } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OrderStatusEmailProps {
  order: OrderWithOrderItem;
}

export const OrderStatusEmail = ({ order }: OrderStatusEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Your order status update and details</Preview>
      <Container style={container}>
        {/* Tracking Header */}
        <Section style={track.container}>
          <Row>
            <Column>
              <Text style={global.paragraphWithBold}>Tracking Number</Text>
              <Text style={track.number}>{order.id}</Text>
            </Column>
            <Column align="right">
              <Link
                href={`https://tire2-go.vercel.app/track-order/${order.id}`}
                style={global.button}
              >
                Track Order
              </Link>
            </Column>
          </Row>
        </Section>

        <Hr style={global.hr} />

        {/* Order Status Section */}
        <Section style={message}>
          <Img
            src={`https://tire2-go.vercel.app/_next/image?url=%2Flogo.png&w=256&q=75`}
            width="66"
            height="22"
            alt="Tire2Go"
            style={{ margin: "auto" }}
          />
          <Heading style={global.heading}>Order Status Update</Heading>
          <Text style={global.text}>
            Your order status has been updated. See the timeline below for
            details.
          </Text>
        </Section>

        <Hr style={global.hr} />

        {/* Timeline */}
        <Section
          style={{ ...paddingX, paddingTop: "20px", paddingBottom: "20px" }}
        >
          <Row>
            <Column>
              <Text style={global.paragraphWithBold}>Order Timeline</Text>
            </Column>
          </Row>

          {order.createdAt && (
            <Row>
              <Column>
                <Text style={global.text}>
                  📝 Placed at {formatDate(order.createdAt)}
                </Text>
              </Column>
            </Row>
          )}
          {order.processingAt && (
            <Row>
              <Column>
                <Text style={global.text}>
                  ⚙️ Processing at {formatDate(order.processingAt)}
                </Text>
              </Column>
            </Row>
          )}
          {order.shippedAt && (
            <Row>
              <Column>
                <Text style={global.text}>
                  🚚 Shipped at {formatDate(order.shippedAt)}
                </Text>
              </Column>
            </Row>
          )}
          {order.completedAt && (
            <Row>
              <Column>
                <Text style={global.text}>
                  ✅ Completed at {formatDate(order.completedAt)}
                </Text>
              </Column>
            </Row>
          )}
        </Section>

        <Hr style={global.hr} />

        {/* Ordered Items Section */}
        <Section
          style={{ ...paddingX, paddingTop: "40px", paddingBottom: "40px" }}
        >
          {order.orderItem.map((item) => (
            <Row key={item.id}>
              <Column>
                <Img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  style={{ float: "left" }}
                  width="260px"
                />
              </Column>
              <Column style={{ verticalAlign: "top", paddingLeft: "12px" }}>
                <Text style={{ ...paragraph, fontWeight: "500" }}>
                  {item.product.brand.name}
                </Text>
                <Text style={{ ...paragraph, fontWeight: "500" }}>
                  {item.product.name}
                </Text>
                <Text style={global.text}>{item.product.tireSize}</Text>
                <Text style={global.text}>x{item.quantity}</Text>
              </Column>
            </Row>
          ))}
        </Section>

        <Hr style={global.hr} />

        {/* Order Summary */}
        <Section
          style={{ ...paddingX, paddingTop: "20px", paddingBottom: "20px" }}
        >
          <Row>
            <Column>
              <Text style={{ ...global.paragraphWithBold, fontSize: "16px" }}>
                Order Summary
              </Text>
            </Column>
          </Row>

          <Row>
            <Column style={{ width: "70%" }}>
              <Text style={global.text}>Order Number</Text>
            </Column>
            <Column style={{ width: "30%", textAlign: "right" }}>
              <Text style={global.text}>{order.id}</Text>
            </Column>
          </Row>

          <Row>
            <Column style={{ width: "70%" }}>
              <Text style={global.text}>Preferred Date</Text>
            </Column>
            <Column style={{ width: "30%", textAlign: "right" }}>
              <Text style={global.text}>{formatDate(order.preferredDate)}</Text>
            </Column>
          </Row>

          <Row>
            <Column style={{ width: "70%" }}>
              <Text style={global.text}>Current Status</Text>
            </Column>
            <Column style={{ width: "30%", textAlign: "right" }}>
              <Text style={global.text}>{order.status}</Text>
            </Column>
          </Row>

          {order.discountedAmount && order.discountedAmount > 0 && (
            <Row>
              <Column style={{ width: "70%" }}>
                <Text style={global.text}>Discount</Text>
              </Column>
              <Column style={{ width: "30%", textAlign: "right" }}>
                <Text style={global.text}>
                  - ₱{formatCurrency(order.discountedAmount)}
                </Text>
              </Column>
            </Row>
          )}

          <Hr style={{ borderColor: "#E5E5E5", margin: "12px 0" }} />

          <Row>
            <Column style={{ width: "70%" }}>
              <Text style={{ ...global.paragraphWithBold, fontSize: "15px" }}>
                Total
              </Text>
            </Column>
            <Column style={{ width: "30%", textAlign: "right" }}>
              <Text style={{ ...global.paragraphWithBold, fontSize: "15px" }}>
                ₱{formatCurrency(order.totalAmount)}
              </Text>
            </Column>
          </Row>
        </Section>

        <Hr style={{ ...global.hr, marginTop: "12px" }} />
        <Section style={paddingY}>
          <Row>
            <Text style={{ ...footer.text, paddingTop: 30, paddingBottom: 30 }}>
              Please contact us if you have any questions. (If you reply to this
              email, we won't be able to see it.)
            </Text>
          </Row>
          <Row>
            <Text style={footer.text}>
              © 2025 Tire2Go. All Rights Reserved.
            </Text>
          </Row>
        </Section>
      </Container>
    </Body>
  </Html>
);

export const OrderStatusEmailHTML = (props: OrderStatusEmailProps) =>
  render(<OrderStatusEmail {...props} />, {
    pretty: true,
  });

/* ------------------ styles (same as your OrderComplete) ------------------ */
const paddingX = { paddingLeft: "40px", paddingRight: "40px" };
const paddingY = { paddingTop: "22px", paddingBottom: "22px" };
const paragraph = { margin: "0", lineHeight: "2" };
const global = {
  paddingX,
  paddingY,
  defaultPadding: { ...paddingX, ...paddingY },
  paragraphWithBold: { ...paragraph, fontWeight: "bold" },
  heading: {
    fontSize: "32px",
    lineHeight: "1.3",
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: "-1px",
  } as React.CSSProperties,
  text: { ...paragraph, color: "#747474", fontWeight: "500" },
  button: {
    border: "1px solid #929292",
    fontSize: "16px",
    textDecoration: "none",
    padding: "10px 0px",
    width: "220px",
    display: "block",
    textAlign: "center",
    fontWeight: 500,
    color: "#000",
  } as React.CSSProperties,
  hr: { borderColor: "#E5E5E5", margin: "0" },
};
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};
const container = {
  margin: "10px auto",
  width: "600px",
  maxWidth: "100%",
  border: "1px solid #E5E5E5",
};
const track = {
  container: { padding: "22px 40px", backgroundColor: "#F7F7F7" },
  number: {
    margin: "12px 0 0 0",
    fontWeight: 500,
    lineHeight: "1.4",
    color: "#6F6F6F",
  },
};
const message = {
  padding: "40px 74px",
  textAlign: "center",
} as React.CSSProperties;
const footer = {
  text: {
    margin: "0",
    color: "#AFAFAF",
    fontSize: "13px",
    textAlign: "center",
  } as React.CSSProperties,
};
