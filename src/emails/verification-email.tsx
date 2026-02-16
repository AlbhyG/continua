import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components';

interface VerificationEmailProps {
  name: string;
  verificationUrl: string;
}

export default function VerificationEmail({
  name,
  verificationUrl,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.section}>
            <Text style={styles.greeting}>Hi {name},</Text>
            <Text style={styles.bodyText}>
              Thanks for your interest in The Personality Continua! Click the
              button below to verify your email address and access your Book
              download.
            </Text>
            <Button href={verificationUrl} style={styles.button}>
              Verify Email Address
            </Button>
            <Text style={styles.expiry}>This link will expire in 24 hours.</Text>
            <Hr style={styles.separator} />
            <Text style={styles.footer}>
              If you didn't request this email, you can safely ignore it.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#f3f4f6',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: '40px 0',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    margin: '0 auto',
    maxWidth: '600px',
    padding: '40px',
  },
  section: {
    margin: 0,
    padding: 0,
  },
  greeting: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 16px 0',
  },
  bodyText: {
    fontSize: '16px',
    lineHeight: '24px',
    color: '#374151',
    margin: '0 0 24px 0',
  },
  button: {
    backgroundColor: '#7C3AED',
    borderRadius: '9999px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: '600',
    padding: '12px 32px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    margin: '0 0 24px 0',
  },
  expiry: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 24px 0',
  },
  separator: {
    borderColor: '#e5e7eb',
    margin: '24px 0',
  },
  footer: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
};
