import Mail from '../../lib/Mail';

class CancellationDeliveryMail {
  get key() {
    return 'CancellationDeliveryMail';
  }

  async handle({ data }) {
    const { deliveryman, recipient, product } = data;
    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Uma encomenda foi cancelada',
      template: 'cancelDelivery',
      context: {
        product,
        recipientName: recipient.name,
        recipientStreet: `${recipient.street}, nr ${recipient.number}, ${recipient.complement} `,
        recipientCity: `${recipient.state} ${recipient.city} CEP: ${recipient.zip_code}`,
      },
    });
  }
}

export default new CancellationDeliveryMail();
