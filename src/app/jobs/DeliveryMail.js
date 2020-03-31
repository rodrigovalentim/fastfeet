import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'DeliveryMail';
  }
  // await Mail.sendMail({
  //   to: `${deliveryman.name} <${deliveryman.email}>`,
  //   subject: 'Você tem uma nova entrega',
  //   template: 'delivery',
  //   context: {
  //     deliveryman: deliveryman.name,
  //     product,
  //     recipient_name: recipientExists.name,
  //     recipient_street: recipientExists.street,
  //     recipient_number: recipientExists.number,
  //     recipient_complement: recipientExists.complement,
  //     recipient_state: recipientExists.state,
  //     recipient_city: recipientExists.city,
  //     recipient_zip_code: recipientExists.zip_code,
  //   },
  // });

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

export default new CancellationMail();
