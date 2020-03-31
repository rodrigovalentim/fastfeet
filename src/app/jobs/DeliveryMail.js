import Mail from '../../lib/Mail';

class DeliveryMail {
  get key() {
    return 'DeliveryMail';
  }

  async handle({ data }) {
    const { deliveryman, recipient, product } = data;
    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Você tem uma nova entrega',
      template: 'delivery',
      context: {
        product,
        recipientName: recipient.name,
        recipientStreet: `${recipient.street}, nr ${recipient.number}, ${recipient.complement} `,
        recipientCity: `${recipient.state} ${recipient.city} CEP: ${recipient.zip_code}`,
      },
    });
  }
}

export default new DeliveryMail();
