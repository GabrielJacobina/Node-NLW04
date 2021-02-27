import { getCustomRepository } from 'typeorm';
import { Request, Response } from 'express';
import { UsersRepository } from '../repositories/UsersRepository';
import { SurveysRepository } from '../repositories/SurveysRepository';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';
import SendMailService from '../services/SendMailService';


class SendMailController {

    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body;

        const usersRepository =  getCustomRepository(UsersRepository);
        const surveysRepository = getCustomRepository(SurveysRepository);
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);
        
        const userAlreadyExists = await usersRepository.findOne({email});

        if(!userAlreadyExists) {
            return response.status(400).json({
                error: "User does not exists"
            });
        }

        const survey =  surveysRepository.findOne({id: survey_id});

        if(!survey) {
            return response.status(400).json({
                error: "Survey does not exists!"
            });
        }

        // Salvar as informações na table surveyUser
        const surveyUser = surveysUsersRepository.create({
            user_id: userAlreadyExists.id,
            survey_id
        })
        await surveysUsersRepository.save(surveyUser);

        // Enviar e-mail para o usuário

        await SendMailService.execute(email, (await survey).title, (await survey).description);

        return response.json(surveyUser);
    }
}

export{ SendMailController }