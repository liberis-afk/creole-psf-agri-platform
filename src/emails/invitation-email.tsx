import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrateur",
  MANAGER: "Gestionnaire",
  EMPLOYEE: "Employé",
};

export function InvitationEmail({
  farmName,
  role,
  inviteUrl,
}: {
  farmName: string;
  role: string;
  inviteUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Vous êtes invité à rejoindre {farmName} sur CREOLE PSF</Preview>
      <Body style={{ backgroundColor: "#f4f4f1", fontFamily: "sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 12,
            margin: "40px auto",
            padding: 32,
            maxWidth: 480,
          }}
        >
          <Heading style={{ fontSize: 20, color: "#1c1917" }}>
            Invitation à rejoindre {farmName}
          </Heading>
          <Text style={{ fontSize: 14, color: "#44403c" }}>
            Vous avez été invité à rejoindre la ferme <strong>{farmName}</strong> sur CREOLE PSF
            en tant que <strong>{roleLabels[role] ?? role}</strong>.
          </Text>
          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <Button
              href={inviteUrl}
              style={{
                backgroundColor: "#15803d",
                color: "#ffffff",
                borderRadius: 8,
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Accepter l&apos;invitation
            </Button>
          </Section>
          <Text style={{ fontSize: 12, color: "#78716c" }}>
            Ce lien expire dans 72 heures. Si vous ne vous attendiez pas à cette invitation, vous
            pouvez ignorer cet email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
