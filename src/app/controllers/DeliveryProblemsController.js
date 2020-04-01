import DeliveryProblems from '../models/DeliveryProblems';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import CancellationDeliveryMail from '../jobs/CancellationDeliveryMail';
import Queue from '../../lib/Queue';

class DeliveryProblemsController {
  async show(req, res) {
    const deliveryProblems = await DeliveryProblems.findAll({
      attributes: ['id', 'description'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id', 'product', 'canceled_at'],
          include: [
            {
              model: Deliveryman,
              as: 'deliveryman',
              attributes: ['name'],
            },
            {
              model: Recipient,
              as: 'recipient',
              attributes: ['name', 'street', 'state'],
            },
          ],
        },
      ],
    });

    if (!deliveryProblems) {
      return res.status(400).json({ error: 'No have problems to show' });
    }

    return res.json(deliveryProblems);
  }

  async index(req, res) {
    const { deliveryId } = req.params;

    const deliveryProblems = await DeliveryProblems.findAll({
      where: { delivery_id: deliveryId },
      attributes: ['id', 'description'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id', 'product', 'canceled_at'],
          include: [
            {
              model: Deliveryman,
              as: 'deliveryman',
              attributes: ['name'],
            },
            {
              model: Recipient,
              as: 'recipient',
              attributes: ['name', 'street', 'state'],
            },
          ],
        },
      ],
    });

    if (!deliveryProblems) {
      return res.status(400).json({ error: 'No have problems to show' });
    }

    return res.json(deliveryProblems);
  }

  async store(req, res) {
    const { deliveryId } = req.params;
    const { description } = req.body;

    const deliveryProblems = await DeliveryProblems.create({
      delivery_id: deliveryId,
      description,
    });

    return res.json(deliveryProblems);
  }

  async delete(req, res) {
    const { problemId } = req.params;

    const deliveryProblems = await DeliveryProblems.findOne({
      where: { id: problemId },
      attributes: ['id', 'description'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          where: { canceled_at: null },
          attributes: ['id', 'product'],
          include: [
            {
              model: Deliveryman,
              as: 'deliveryman',
              attributes: ['name', 'email'],
            },
            {
              model: Recipient,
              as: 'recipient',
              attributes: ['name', 'street', 'state'],
            },
          ],
        },
      ],
    });

    if (!deliveryProblems) {
      return res.status(400).json({ error: 'No have problems to cancel' });
    }

    const { delivery } = deliveryProblems;

    delivery.canceled_at = new Date();

    await delivery.save();

    const { deliveryman, recipient, product } = delivery;

    await Queue.add(CancellationDeliveryMail.key, {
      deliveryman,
      recipient,
      product,
    });

    return res.json(deliveryProblems);
  }
}

export default new DeliveryProblemsController();
