import Mail from '../../lib/Mail';

class UpdateDeliveryMail {
  get key() {
    return 'UpdateDeliveryMail';
  }

  async handle({ data }) {
    const { deliveryman, recipient, product } = data;
    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Entrega foi atualizada',
      template: 'updateDelivery',
      context: {
        product,
        recipientName: recipient.name,
        recipientStreet: `${recipient.street}, nr ${recipient.number}, ${recipient.complement} `,
        recipientCity: `${recipient.state} ${recipient.city} CEP: ${recipient.zip_code}`,
      },
    });
  }
}

export default new UpdateDeliveryMail();
